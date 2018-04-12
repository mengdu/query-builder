'use strict'
import {cb} from './utils/decorators'

export default class Builder {

  constructor (options) {
    // do
  }

  tableName = null

  @cb('this')
  table (name) {
    this.tableName = name
  }

  
  where () {}
  orWhere () {}
  lists () {}
  limit () {}
  distinct () {}
  join () {}
  leftJoin () {}
  count () {}
  orderBy () {}
  groupBy () {}
  having () {}
  havingRaw () {}
  skip () {}
  take () {}

  select () {}
  get () {}
  update () {}
  delete () {}

  toSql () {}
}
