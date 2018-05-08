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

  constructor (options = {}) {
    this.connect = options.connect

    this._tableName = ''
    this._type = ''
    this._join = ''
    this._where = ''
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
  static table (name, options = {}) {
    if (!name) throw new Error('Table name is not found.')

    let builder = new Builder({name, ...options})
    builder._tableName = name

    return builder
  }

  static query (sql, params) {
    if (!params) return sql
    return sql.replace(/\:(\w+)/g, function (txt, key) {
      if (params.hasOwnProperty(key)) {
        return SqlString.escape(params[key])
      }
      return txt
    })
  }

  @cb()
  table (name, options = {}) {
    this._tableName = SqlString.escapeId(name)
  }

  @cb()
  where (conditions = {}) {
    let conds = makeWhere(conditions)
    this._where = 'where ' + conds.join(' and ')
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
  select (params = ['*']) {
    let fields = ''
    if (params) {
      fields = params.map(field => {
        // console.log(e, SqlString.raw('now() as now'))
        // return SqlString.escapeId(e.replace(/\.| +as +/ig, s => SqlString.escapeId(s)))
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
    let data = arr
    if (typeof arr !== 'object') throw new Error('The arguments must be an array or object.')
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

  exec () {
    if (!this.connect) {
      throw new Error('Connect is undefined')
    }
    return new Promise((resolve, reject) => {

      this.connect.query(this.toString(), (err, result, fields) => {
        if (err) {
          reject(err)
        } else {
          resolve(result, fields)
        }
        // this.connect.destroy()
      })
    })
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
          this._where
        ]
        break
      case 'update':
        sqls = [
          'update',
          this._tableName,
          this._update,
          this._where
        ]
        break
    }
    return sqls.filter(e => !!e).join(' ')
  }
}
