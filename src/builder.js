'use strict'
import SqlString from 'sqlstring'
import {cb, test} from './utils/decorators'
import operators from './utils/operators'

export default class Builder {

  constructor (options = {}) {
    this.connect = options.connect

    this._tableName = ''
    this._type = ''
    this._join = ''
    this._where = ''
    this._limit = ''
    this._sql = ''
  }

  @cb()
  table (name) {
    this._tableName = SqlString.escapeId(name)
  }

  @cb()
  where (conditions = {}) {
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
    this._where = 'where ' + conds.join(' and ')
  }

  @cb()
  limit (limit = 1, offset = 0) {
    this._limit = `limit ${limit}`
    if (offset) {
      this._limit += `offset ${offset}`
    }
  }

  // distinct () {}

  join () {}
  leftJoin () {}

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


  having () {}


  select (params = ['*']) {
    let fields = ''
    if (params) {
      fields = params.map(e => {
        return SqlString.escapeId(e.replace(/\.| +as +/ig, s => SqlString.escapeId(s)))
      }).join(', ')
    } else {
      fields = '*'
    }
    this._fields = fields
    this._type = `select`

    return {
      toString: this.toString.bind(this),
      exec: this.exec.bind(this)
    }
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
        this.connect.destroy()
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
          this._order,
          this._group,
          this._having
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
