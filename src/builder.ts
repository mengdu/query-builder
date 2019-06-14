'use strict'
import * as utils from './utils'

interface rawSqlType { toSqlString: () => string }
type fieldAliasType = [string | rawSqlType, string | undefined]
interface fieldObjType {
  [key: string]: string | fieldAliasType;
  [key: number]: string | fieldAliasType
}

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

  static raw (sql: string): rawSqlType {
    return utils.raw(sql)
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
