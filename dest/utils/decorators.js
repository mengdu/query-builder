'use strict';
/**
 * 更改函数返回值
 * @param {any} params 指定返回值
 * @return {any|this} 返回指定值，默认返回当前对象
 **/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cb = cb;
exports.test = test;
function cb(params) {
  return function (target, key, decorator) {
    var oldFn = decorator.value;
    // 重写函数体
    decorator.value = function () {
      // 运行原来的函数
      oldFn.apply(this, arguments);
      // 返回指定值，默认返回当前对象
      return params || this;
    };
    return decorator;
  };
}

function test() {
  return function (target, key, decorator) {
    throw new Error('this is a test');
  };
}
//# sourceMappingURL=decorators.js.map