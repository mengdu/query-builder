'use strict'
import SqlString from 'sqlstring'
import {cb, test} from './utils/decorators'
import operators from './utils/operators'

function makeWhere (conditions = {}) {
  let conds = []
  for (let key in conditions) {
    if (typeof conditions[key] === 'object' && !(conditions[key] instanceof Date)) {
      for (let op in conditions[key]) {

        if (typeof operators[op] === 'function') {
          conds.push(`${SqlString.escapeId(key)} ${operators[op](conditions[key][op])}`)
        } else {
          console.warn(`\'${op}\' operator symbol is not defined.`)
        }
      }
    } else {
      conds.push(`${SqlString.escapeId(key)} = ${SqlString.escape(conditions[key])}`)
    }
  }
  return conds
}

function makeField (fieldString) {
  let chunk = fieldString
  if (typeof chunk === 'object' && typeof chunk.toSql === 'function') {
    return chunk.toSql()
  }
  // 去掉两边空格
  chunk = chunk.replace(/^\s*|\s*$/g, '')
  // users.name as test
  if (/\w+ +as +\w+/.test(chunk)) {
    let chs = chunk.split(/ +as +/)
    return makeField(chs[0]) + ' as ' + SqlString.escapeId(chs[1])
  }

  // users.name
  if (/\w+\.\w+/.test(chunk)) {
    let chs = chunk.split('.')
    return SqlString.escapeId(chs[0]) + '.' + SqlString.escapeId(chs[1])
  }
  // name
  return SqlString.escapeId(chunk)
}

export default class Builder {

  constructor () {

    this._tableName = ''
    this._type = ''
    this._join = ''
    this._where = ''
    this._orWhere = ''
    this._limit = ''
    this._sql = ''
    this._order = ''
    this._group = ''
    this._having = ''
    this._fields = ''
    this._insert = ''
    this._update = ''
  }
  static raw (sql) {
    if (typeof sql !== 'string') {
      throw new TypeError('argument sql must be a string');
    }
    return {
      toSql () {return sql}
    }
  }
  static table (name) {
    if (!name) throw new Error('Table name is not found.')

    let builder = new Builder()
    builder._tableName = makeField(name)

    return builder
  }

  static query (sql, params) {
    if (!params) return sql
    let index = 0
    return sql.replace(/\:(\w+)/g, function (txt, key) {
      if (params.hasOwnProperty(key)) {
        return SqlString.escape(params[key])
      }
      return txt
    }).replace(/\?/g, function (placeholder) {
      return SqlString.escape(params[index++])
    })
  }

  @cb()
  table (name) {
    this._tableName = makeField(name)
  }

  @cb()
  where (conditions = {}) {
    let conds = makeWhere(conditions)
    this._where = 'where ' + conds.join(' and ')
  }

  @cb()
  orWhere (conditions = {}) {
    if (!this._where) throw new Error('A where statement is required to use the or statement')
    let conds = makeWhere(conditions)
    this._orWhere = `or (${conds.join(' and ')})`
  } 

  @cb()
  limit (limit = 1, offset = 0) {
    this._limit = `limit ${limit}`
    if (offset) {
      this._limit += ` offset ${offset}`
    }
  }

  @cb()
  join (table, field1, operator, field2) {
    if (!table || !field2) {
      throw new Error('the arguments error')
    }
    this._join += `join ${makeField(table)} on ${makeField(field1)} ${operator} ${makeField(field2)} `
  }

  @cb()
  leftJoin (table, field1, operator, field2) {
    if (!table || !field2) {
      throw new Error('the arguments error')
    }
    this._join += `left join ${makeField(table)} on ${makeField(field1)} ${operator} ${makeField(field2)} `
  }

  @cb()
  orderBy (fields) {
    if (typeof fields !== 'object') throw new Error('The arguments must be an object.')
    let orders = []
    for (let field in fields) {
      let order = fields[field].toLocaleLowerCase().trim() === 'desc' ? 'desc' : 'asc'
      orders.push(`${SqlString.escapeId(field)} ${order}`)
    }

    this._order = 'order by ' + orders.join(', ')
  }

  @cb()
  groupBy (arr) {
    if (!Array.isArray(arr)) throw new Error('The arguments must be an array.')

    this._group = `group by ${arr.map(e => SqlString.escapeId(e)).join(', ')}`
  }

  @cb()
  having (conditions = {}) {
    let conds = makeWhere(conditions)

    this._having = 'having ' + conds.join(' and ')
  }

  @cb()
  select (args) {
    let params = []
    if (Array.isArray(arguments[0])) {
      params = arguments[0]
    } else if (typeof arguments[0] === 'string') {
      params = []
      for (let i = 0; i < arguments.length; i++) {
        params.push(arguments[i])
      }
    }
    if (!args) params = ['*']

    let fields = ''
    if (params) {
      fields = params.map(field => {
        return makeField(field)
      }).join(', ')
    } else {
      fields = '*'
    }
    this._fields = fields
    this._type = `select`
  }

  @cb()
  insert (arr) {
    if (typeof arr !== 'object') throw new Error('The arguments must be an array or object.')
    let data = arr
    if (!Array.isArray(arr)) {
      data = [arr]
    }
    let fields = Object.keys(data[0])
    let values = data.map(item => {
      let value = []
      for (let i in fields) {
        value.push(SqlString.escape(item[fields[i]]))
      }
      return `(${value.join(', ')})`
    }).join(', ')

    this._insert = `(${fields.map(e => SqlString.escapeId(e)).join(', ')}) values${values}`
    this._type = 'insert'
  }

  @cb()
  update (data) {
    if (typeof data !== 'object') throw new Error('The arguments must be an object.')
    let items = []

    for (let key in data) {
      items.push(`${SqlString.escapeId(key)} = ${SqlString.escape(data[key])}`)
    }

    this._update = `set ${items.join(', ')}`
    this._type = 'update'
  }

  @cb()
  delete () {
    this._type = 'delete'
  }

  findAll (conditions) {
    if (!conditions) {
      this.select()
      conditions = {}
    }
    let {attrs, where, orWhere, join, leftJoin, group, order, having, limit, offset} = conditions
    attrs = attrs || ['*']
    if (attrs) this.select.apply(this, attrs)
    if (where) this.where(where)
    if (orWhere) this.orWhere(orWhere)
    if (join) this.join.apply(this, join)
    if (leftJoin) this.leftJoin.apply(this, leftJoin)
    if (group) this.groupBy(group)
    if (order) this.orderBy(order)
    if (having) this.having(having)
    if (typeof limit !== 'undefined') {
      this.limit(limit, offset)
    }
    return this.toString()
  }

  static findAll (options = {}) {
    if (!options.table) throw new Error('options.table is not defined')
    let table = Builder.table(options.table)

    return table.findAll.call(table, options)
  }

  toString (isReload) {
    if (this._sql && isReload) return this._sql

    let sqls = []
    switch (this._type) {
      case 'select':
        sqls = [
          `select ${this._fields} from`,
          this._tableName,
          this._join,
          this._where,
          this._orWhere,
          this._group,
          this._having,
          this._order,
          this._limit
        ]
        break
      case 'insert':
        sqls = [
          `insert into`,
          this._tableName,
          this._insert
        ]
        break
      case 'delete':
        sqls = [
          'delete from',
          this._tableName,
          this._where,
          this._orWhere
        ]
        break
      case 'update':
        sqls = [
          'update',
          this._tableName,
          this._update,
          this._where,
          this._orWhere
        ]
        break
    }
    return sqls.filter(e => !!e).join(' ')
  }
}
