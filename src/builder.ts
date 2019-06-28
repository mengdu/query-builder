'use strict'
import * as utils from './utils'
import operators from './utils/operators'

interface rawSqlType { toSqlString: () => string }
type fieldType = string | rawSqlType | [string | rawSqlType, string]
interface joinOptionType {
  as?: string,
  direction?: string,
  on?: { [key: string]: any }
}
interface joinsOptionType {
  table: string | Builder,
  as?: string,
  direction?: string,
  on?: { [key: string]: any }
}

type orderType = 'DESC' | 'ASC' | 'desc' | 'asc'

export default class Builder {
  protected $fields: string = '';
  protected $update: string = '';
  protected $insert: string = '';
  protected $limit: string = '';
  protected $operType: string = '';
  protected $where: string = '';
  protected $or: string = '';
  protected $having: string = '';
  protected $orderBy: string = '';
  protected $groupBy: string = '';
  protected $joins: string[] = [];
  protected $tableName: string;
  protected $tableAlias: string | null;
  protected $sql: string = '';
  protected $operators: { [key: string]: any } = { ...operators };

  constructor (tableName: string, tableAlias: string | null = null) {
    if (!tableName || typeof tableName !== 'string') throw new Error('`tableName` must be a string')
    if (tableAlias && typeof tableAlias !== 'string') throw new Error('`tableAlias` must be a string')

    this.$tableName = tableName
    this.$tableAlias = tableAlias
  }

  static raw (sql: string): rawSqlType {
    return utils.raw(sql)
  }

  private generateCondition (conditions: { [key: string]: any }, type: string = 'and'): string {
    if (typeof conditions !== 'object') throw new Error('An argument must be object')

    const conds: string[] = []
    for (const key in conditions) {
      const value = conditions[key]

      if (key === '$and' && Array.isArray(value)) {
        // support where.$and = [{ key: val }, { key: val }]
        const and = value.map(e => {
          const chunk = `${this.generateCondition(e)}`
          return chunk.split('and').length > 1 ? `(${chunk})` : chunk
        }).join(' and ')
        conds.push(`(${and})`)
        continue
      } else if (key === '$and' && typeof value === 'object') {
        // support where.$and = { key: val }
        conds.push(`(${this.generateCondition(value)})`)
        continue
      }

      // support where.$or = [{ key: val }] | {key: val}
      if (key === '$or') {
        if (utils.isArr(value)) {
          const or = value.map((e: { [key: string]: any }) => {
            const chunk = this.generateCondition(e)
            return chunk.split(' and ').length > 1 ? `(${chunk})` : chunk
          }).join(' or ')
          conds.push(`(${or})`)
          continue
        } else if (typeof value === 'object') {
          conds.push(`(${this.generateCondition(value, 'or')})`)
          continue
        }
      }

      // support where.$raw = 'raw'
      if (key === '$raw') {
        value && conds.push(utils.raw(value).toSqlString())
        continue
      }

      if (typeof value === 'object' && !(value instanceof Date)) {
        // where.key = []
        if (utils.isArr(value)) {
          conds.push(`${utils.escapeId(key)} in (${value.map((e: string) => utils.escape(e)).join(',')})`)
          continue
        }

        // where.key = raw('is null')
        if (utils.isFun(value.toSqlString)) {
          conds.push(`${utils.escapeId(key)} ${value.toSqlString()}`)
          continue
        }

        for (let operator in value) {
          if (typeof this.$operators[operator] === 'function') {
            conds.push(`${utils.escapeId(key)} ${this.$operators[operator](value[operator])}`)
          } else {
            console.warn(`The '${operator}' operator is not defined.`)
          }
        }
      } else {
        conds.push(`${utils.escapeId(key)} = ${utils.escape(value)}`)
      }
    }

    return conds.join(` ${type} `)
  }

  /**
   * 指定需要查询字段
   * @param {array<fieldType>} attrs
   * @returns {Builder}
   * **/
  select (attrs: Array<fieldType> = ['*']): Builder {
    if (!utils.isArr(attrs) || attrs.length === 0) {
      throw new Error('One param must be Array and cannot be `[]`')
    }

    this.$fields = attrs.map((field) => {
      if (typeof field === 'object' && utils.isFun((<rawSqlType>field).toSqlString)) {
        return (<rawSqlType>field).toSqlString()
      }

      if (utils.isArr(field)) {
        let temp = ''
        if (utils.isFun((<rawSqlType>(<[rawSqlType, string]>field)[0]).toSqlString)) {
          temp += (<rawSqlType>(<[rawSqlType, string]>field)[0]).toSqlString()
        } else {
          temp += utils.escapeField((<string[]>field)[0])
        }

        if ((<string[]>field)[1]) {
          temp += ` as ${utils.escapeField((<string[]>field)[1])}`
        }
        return temp
      }

      return utils.escapeField((<string>field))
    }).join(',')

    this.$operType = 'select'
    return this
  }

  insert (data: Array<{ [key: string]: any }>): Builder {
    if (!utils.isArr(data) || data.length === 0) throw new Error('An argument must be Array and cannot be empty')

    this.$operType = 'insert'
    const fields = Object.keys(data[0])

    if (fields.length === 0) throw new Error('Cannot insert empty object into table')

    const fieldSql = [`(${fields.map(e => utils.escapeId(e)).join(',')})`]
    const valueSql = []

    for (let i in data) {
      valueSql.push(`(${fields.map(e => utils.escape(data[i][e])).join(',')})`)
    }

    this.$insert = `${fieldSql} values${valueSql.join(',')}`

    return this
  }

  create (data: { [key: string]: any }): Builder {
    if (utils.isEmptyObject(data)) throw new Error('An argument for `data` cannot be empty object')

    this.$operType = 'insert'
    const fields = Object.keys(data)

    this.$insert = `(${fields.map(e => utils.escapeId(e)).join(',')}) values(${fields.map(e => utils.escape(data[e])).join(',')})`

    return this
  }

  update (data: { [key: string]: any }): Builder {
    if (typeof data !== 'object' || utils.isArr(data) || utils.isEmptyObject(data)) {
      throw new Error('An argument for `data` must be an object and cannot be `Array` or `{}`')
    }

    this.$operType = 'update'
    const items = []
    for (const key in data) {
      items.push(`${utils.escapeId(key)} = ${utils.escape(data[key])}`)
    }

    this.$update = `set ${items.join(',')}`
    return this
  }

  delete (): Builder {
    this.$operType = 'delete'

    return this
  }

  where (conditions: { [key: string]: any }): Builder {
    if (typeof conditions !== 'object' || utils.isArr(conditions)) {
      throw new Error('An argument for `conditions` must be an object and cannot be `Array`')
    }

    if (utils.isEmptyObject(conditions)) {
      this.$where = ''
      return this
    }

    this.$where = `where ${this.generateCondition(conditions)}`
    return this
  }

  having (conditions: { [key: string]: any }): Builder {
    if (typeof conditions !== 'object' || utils.isArr(conditions)) {
      throw new Error('An argument for `conditions` must be an object and cannot be `Array`')
    }

    if (utils.isEmptyObject(conditions)) {
      this.$having = ''
      return this
    }

    this.$having = `having ${this.generateCondition(conditions)}`
    return this
  }

  order (fields: { [key: string]: orderType } | Array<[string, orderType]>): Builder {
    const orders = []

    for (const key in fields) {
      if (utils.isArr((<Array<[string, orderType]>>fields)[+key])) {
        const field = utils.escapeId((<Array<[string, orderType]>>fields)[+key][0])
        const value = (<Array<[string, orderType]>>fields)[+key][1].toLocaleLowerCase().trim() === 'desc' ? 'desc' : 'asc'
        orders.push(`${field} ${value}`)
      } else {
        orders.push(`${utils.escapeId(key)} ${(<{ [key: string]: orderType }>fields)[key].toLocaleLowerCase().trim() === 'desc' ? 'desc' : 'asc'}`)
      }
    }

    this.$orderBy = orders.length > 0 ? `order by ${orders.join(',')}` : ''

    return this
  }

  group (arr: string[]): Builder {
    this.$groupBy = arr.length > 0 ? `group by ${arr.map(e => utils.escapeId(e)).join(',')}` : ''
    return this
  }

  joins (arr: joinsOptionType[]): Builder {
    if (!utils.isArr(arr)) throw new Error('An argument for `arr` must be Array')

    for (const i in arr) {
      this.join(arr[i].table, arr[i])
    }

    return this
  }

  join (table: string | Builder, opt?: joinOptionType): Builder {
    if (!table) throw new Error('An argument for `table` must be provided')

    if (!opt) opt = {}
    let direction = ''

    switch (opt.direction) {
      case 'left':
        direction = 'left join'
        break
      case 'right':
        direction = 'right join'
        break
      default:
        direction = 'join'
    }

    if (typeof table === 'object' && !utils.isFun(table.toSql)) throw new Error('Cannot find `toSql` method')

    const sql = typeof table === 'string' ? utils.escapeId(table) : `(${table.toSql()})`
    const onSql = opt.on ? ` on ${this.generateCondition(opt.on)}` : ''

    this.$joins.push(`${direction} ${sql}${opt.as ? ' as ' + utils.escapeId(opt.as) : ''}${onSql}`)

    return this
  }

  limit (offset: number = 1, limit: number): Builder {
    if (typeof limit === 'undefined') this.$limit = `limit ${+offset}`
    else this.$limit = `limit ${+offset}, ${+limit}`

    return this
  }

  toSql (alias?: string): string {
    let chunks: string[] = []

    switch (this.$operType) {
      case 'select':
        chunks = [
          `select ${this.$fields} from`,
          utils.escapeId(this.$tableName),
          this.$tableAlias ? `as ${utils.escapeId(this.$tableAlias)}` : '',
          this.$joins.length > 0 ? this.$joins.join(' ') : '',
          this.$where,
          this.$or,
          this.$groupBy,
          this.$having,
          this.$orderBy,
          this.$limit
        ]
        break
      case 'insert':
        chunks = [
          'insert into',
          this.$tableName + this.$insert
        ]
        break
      case 'delete':
        chunks = [
          'delete from',
          utils.escapeId(this.$tableName),
          this.$where,
          this.$or
        ]
        break
      case 'update':
        chunks = [
          'update',
          utils.escapeId(this.$tableName),
          this.$update,
          this.$where,
          this.$or
        ]
        break
    }

    const sql = chunks.filter(e => !!e).join(' ')

    this.$sql = (this.$operType === 'select' && alias) ? `(${sql}) as ${alias}` : sql

    return this.$sql
  }
}
