'use strict'

export function cb (params) {
  return function (target, key, decorator) {
    console.log(target)
    // return 'params'
    return target
  }
}
