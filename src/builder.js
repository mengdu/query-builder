'use strict'
import {cb, test} from './utils/decorators'

export default class Builder {

  constructor (options) {
    // do
  }

  tableName = null

  @cb()
  table (name) {
    this.tableName = name
    return this.tableName
  }

  @test()
  where () {
    console.log('where')
  }
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
