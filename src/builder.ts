'use strict'
import * as utils from './utils'
interface anyObj { [key: string]: string; [key: number]: string }

export default class Builder {
  protected $fields: string;
  protected $limit: string;
  protected $operType: string;
  protected $where: string;
  protected $tableName: string;
  protected $tableAlias: string | null;

  constructor (tableName: string, tableAlias: string | null = null) {
    this.$fields = ''
    this.$limit = ''
    this.$operType = ''
    this.$where = ''
    this.$tableName = tableName
    this.$tableAlias = tableAlias
  }

  select (attrs: anyObj | Array<string>): Builder {
    let params = []
    if (utils.isArr(attrs)) {
      params = (<Array<string>>attrs).map(e => e)
    } else {
      for (let key in attrs) {
        params.push(`${key} as ${attrs[key]}`)
      }
    }

    this.$fields = params.map(field => {
      return utils.escapeField(field)
    }).join(',')

    this.$operType = 'select'
    return this
  }
  create () {
    this.$operType = 'insert'
  }
  update () {
    this.$operType = 'update'
  }
  delete () {
    this.$operType = 'delete'
  }
  where () {}
  having () {}
  order () {}
  group () {}
  join () {}
  limit (offset: number = 0, len: number = 10): Builder {
    this.$limit = `limit ${offset}, ${len}`
    return this
  }
  union () {}
  sql () {}
}
