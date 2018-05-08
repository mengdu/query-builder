'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sqlstring = require('sqlstring');

var _sqlstring2 = _interopRequireDefault(_sqlstring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var operators = {
  // $and: function (conds) {},
  // $or: function (conds) {
  //   let kvs = []
  //   for (let key in conds) {
  //     kvs.push(`${SqlString.escapeId(key)} = ${SqlString.escape(conds[key])}`)
  //   }
  //   return `or (${kvs.join(', ')})`
  // },
  // >
  $gt: function $gt(val) {
    return '> ' + _sqlstring2.default.escape(val);
  },
  $gte: function $gte(val) {
    return '>= ' + _sqlstring2.default.escape(val);
  },
  // <
  $lt: function $lt(val) {
    return '< ' + _sqlstring2.default.escape(val);
  },
  $lte: function $lte(val) {
    return '<= ' + _sqlstring2.default.escape(val);
  },
  $eq: function $eq(val) {
    return '= ' + _sqlstring2.default.escape(val);
  },
  // !=
  $ne: function $ne(val) {
    return '!= ' + _sqlstring2.default.escape(val);
  },
  $between: function $between(arr) {
    return 'between ' + _sqlstring2.default.escape(arr[0]) + ' and ' + _sqlstring2.default.escape(arr[1]);
  },
  $notBetween: function $notBetween(arr) {
    return 'not ' + operators.$between(arr);
  },
  $in: function $in(arr) {
    if (!Array.isArray(arr)) {
      throw new Error('The arguments must be an array');
    }
    return 'in (' + arr.map(function (e) {
      return _sqlstring2.default.escape(e);
    }).join(', ') + ')';
  },
  $notIn: function $notIn(arr) {
    return 'not ' + operators.$in(arr);
  },
  $like: function $like(val) {
    return 'like ' + _sqlstring2.default.escape(val);
  },
  $notLike: function $notLike(val) {
    return 'not like' + operators.$like(val);
  }
};

exports.default = operators;
//# sourceMappingURL=operators.js.map