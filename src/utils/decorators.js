'use strict'
/**
 * 更改函数返回值
 * @param {any} params 指定返回值
 * @return {any|this} 返回指定值，默认返回当前对象
 **/
export function cb (params) {
  return function (target, key, decorator) {
    let oldFn = decorator.value
    // 重写函数体
    decorator.value = function () {
      // 运行原来的函数
      oldFn.apply(this, arguments)
      // 返回指定值，默认返回当前对象
      return params || target
    }
    return decorator
  }
}

export function test () {
  return function (target, key, decorator) {
    throw new Error('this is a test')
  }
}
