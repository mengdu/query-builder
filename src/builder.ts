'use strict'
import * as utils from './utils'
import operators from './utils/operators'

interface rawSqlType { toSqlString: () => string }
type fieldAliasType = [string | rawSqlType, string | undefined]

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
  protected $join: string = '';
  protected $tableName: string;
  protected $tableAlias: string | null;
  protected $sql: string = '';
  protected $operators: { [key: string]: any } = { ...operators };

  constructor (tableName: string, tableAlias: string | null = null) {
    this.$tableName = tableName
    this.$tableAlias = tableAlias
  }

  static raw (sql: string): rawSqlType {
    return utils.raw(sql)
  }

  private generateCondition (conditions: { [key: string]: any }): string {
    const conds: string[] = []
    for (const key in conditions) {
      if (typeof conditions[key] === 'object' && !(conditions[key] instanceof Date)) {
        for (let operator in conditions[key]) {
          if (typeof this.$operators[operator] === 'function') {
            conds.push(`${utils.escapeId(key)} ${this.$operators[operator](conditions[key][operator])}`)
          } else {
            console.warn(`The \'${operator}\' operator is not defined.`)
          }
        }
      } else {
        conds.push(`${utils.escapeId(key)}=${utils.escape(conditions[key])}`)
      }
    }

    return conds.join(' and ')
  }

  /**
   * 指定需要查询字段
   * @param {array<string | fieldAliasType>} attrs
   * @returns {Builder}
   * **/
  select (attrs: Array<string | fieldAliasType> = ['*']): Builder {
    this.$fields = attrs.map((field) => {
      if (utils.isArr(field)) {
        let temp = ''
        if (utils.isFun((<rawSqlType>field[0]).toSqlString)) {
          temp += (<rawSqlType>field[0]).toSqlString()
        } else {
          temp += utils.escapeField(<string>field[0])
        }

        if (field[1]) {
          temp += ` as ${utils.escapeField(field[1])}`
        }
        return temp
      }

      return utils.escapeField((<string>field))
    }).join(',')

    this.$operType = 'select'
    return this
  }

  insert (data: { [key: string]: any }): Builder {
    return this.create(data)
  }

  create (data: { [key: string]: any }): Builder {
    this.$operType = 'insert'
    const fields = Object.keys(data)

    this.$insert = `(${fields.map(e => utils.escapeId(e)).join(',')}) values(${fields.map(e => utils.escape(data[e])).join(',')})`

    return this
  }

  update (data: { [key: string]: any }): Builder {
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
    this.$where = `where ${this.generateCondition(conditions)}`
    return this
  }

  orWhere (conditions: { [key: string]: any }): Builder {
    if (!this.$where) throw new Error('WHERE statement does not exist and OR statement cannot be used')
    this.$where = `or ${this.generateCondition(conditions)}`
    return this
  }

  having (conditions: { [key: string]: any }): Builder {
    this.$having = `having ${this.generateCondition(conditions)}`
    return this
  }

  order (fields: { [key: string]: string }): Builder {
    const orders = []

    for (const key in fields) {
      orders.push(`${utils.escapeId(key)} ${fields[key].toLocaleLowerCase().trim() === 'desc' ? 'desc' : 'asc'}`)
    }

    this.$orderBy = `order by ${orders.join(',')}`

    return this
  }

  group (arr: string[]): Builder {
    this.$groupBy = `group by ${arr.map(e => utils.escapeId(e)).join(',')}`
    return this
  }

  join (table: string | Builder,
  opt: {
    as: string, 
    direction: string,
    on: { [key: string]: any }
  }): Builder {
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
    const sql = typeof table === 'string' ? utils.escapeId(table) : `(${table.toSql()})`
    this.$join = `${direction} ${sql}${opt.as ? ' as ' + utils.escapeId(opt.as) : ''} on ${this.generateCondition(opt.on)}`

    return this
  }

  limit (offset: number = 0, len: number = 10): Builder {
    this.$limit = `limit ${offset}, ${len}`
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
          this.$join,
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
          this.$tableName,
          this.$insert
        ]
        break
      case 'delete':
        chunks = [
          'delete from',
          this.$tableName,
          this.$where,
          this.$or
        ]
        break
      case 'update':
        chunks = [
          'update',
          this.$tableName,
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
