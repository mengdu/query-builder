'use strict'
import SqlString from 'sqlstring'

const operators = {
  $gt: function (val) {
    return `> ${SqlString.escape(val)}`
  },
  $gte: function (val) {
    return `>= ${SqlString.escape(val)}`
  },
  // <
  $lt: function (val) {
    return `< ${SqlString.escape(val)}`
  },
  $lte: function (val) {
    return `<= ${SqlString.escape(val)}`
  },
  $eq: function (val) {
    return `= ${SqlString.escape(val)}`
  },
  // !=
  $ne: function (val) {
    return `!= ${SqlString.escape(val)}`
  },
  $between: function (arr) {
    return `between ${SqlString.escape(arr[0])} and ${SqlString.escape(arr[1])}`
  },
  $notBetween: function (arr) {
    return `not ` + operators.$between(arr)
  },
  $in: function (arr) {
    if (!Array.isArray(arr)) {
      throw new Error('The arguments must be an array')
    }
    return 'in (' + arr.map(e => SqlString.escape(e)).join(', ') + ')'
  },
  $notIn: function (arr) {
    return 'not ' + operators.$in(arr)
  },
  $like: function (val) {
    return `like ${SqlString.escape(val)}`
  },
  $notLike: function (val) {
    return 'not like' + operators.$like(val)
  }
}

export default operators
