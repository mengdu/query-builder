'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _desc, _value, _class;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _sqlstring = require('sqlstring');

var _sqlstring2 = _interopRequireDefault(_sqlstring);

var _decorators = require('./utils/decorators');

var _operators = require('./utils/operators');

var _operators2 = _interopRequireDefault(_operators);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

function makeWhere() {
  var conditions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var conds = [];
  for (var key in conditions) {
    if (_typeof(conditions[key]) === 'object' && !(conditions[key] instanceof Date)) {
      for (var op in conditions[key]) {

        if (typeof _operators2.default[op] === 'function') {
          conds.push(_sqlstring2.default.escapeId(key) + ' ' + _operators2.default[op](conditions[key][op]));
        } else {
          console.warn('\'' + op + '\' operator symbol is not defined.');
        }
      }
    } else {
      conds.push(_sqlstring2.default.escapeId(key) + ' = ' + _sqlstring2.default.escape(conditions[key]));
    }
  }
  return conds;
}

function makeField(fieldString) {
  var chunk = fieldString;
  if ((typeof chunk === 'undefined' ? 'undefined' : _typeof(chunk)) === 'object' && typeof chunk.toSql === 'function') {
    return chunk.toSql();
  }
  // 去掉两边空格
  chunk = chunk.replace(/^\s*|\s*$/g, '');
  // users.name as test
  if (/\w+ +as +\w+/.test(chunk)) {
    var chs = chunk.split(/ +as +/);
    return makeField(chs[0]) + ' as ' + _sqlstring2.default.escapeId(chs[1]);
  }

  // users.name
  if (/\w+\.\w+/.test(chunk)) {
    var _chs = chunk.split('.');
    return _sqlstring2.default.escapeId(_chs[0]) + '.' + _sqlstring2.default.escapeId(_chs[1]);
  }
  // name
  return _sqlstring2.default.escapeId(chunk);
}

var Builder = (_dec = (0, _decorators.cb)(), _dec2 = (0, _decorators.cb)(), _dec3 = (0, _decorators.cb)(), _dec4 = (0, _decorators.cb)(), _dec5 = (0, _decorators.cb)(), _dec6 = (0, _decorators.cb)(), _dec7 = (0, _decorators.cb)(), _dec8 = (0, _decorators.cb)(), _dec9 = (0, _decorators.cb)(), _dec10 = (0, _decorators.cb)(), _dec11 = (0, _decorators.cb)(), _dec12 = (0, _decorators.cb)(), _dec13 = (0, _decorators.cb)(), (_class = function () {
  function Builder() {
    _classCallCheck(this, Builder);

    this._tableName = '';
    this._type = '';
    this._join = '';
    this._where = '';
    this._orWhere = '';
    this._limit = '';
    this._sql = '';
    this._order = '';
    this._group = '';
    this._having = '';
    this._fields = '';
    this._insert = '';
    this._update = '';
  }

  _createClass(Builder, [{
    key: 'table',
    value: function table(name) {
      this._tableName = makeField(name);
    }
  }, {
    key: 'where',
    value: function where() {
      var conditions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var conds = makeWhere(conditions);
      this._where = 'where ' + conds.join(' and ');
    }
  }, {
    key: 'orWhere',
    value: function orWhere() {
      var conditions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!this._where) throw new Error('A where statement is required to use the or statement');
      var conds = makeWhere(conditions);
      this._orWhere = 'or (' + conds.join(' and ') + ')';
    }
  }, {
    key: 'limit',
    value: function limit() {
      var _limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      this._limit = 'limit ' + _limit;
      if (offset) {
        this._limit += ' offset ' + offset;
      }
    }
  }, {
    key: 'join',
    value: function join(table, field1, operator, field2) {
      if (!table || !field2) {
        throw new Error('the arguments error');
      }
      this._join += 'join ' + makeField(table) + ' on ' + makeField(field1) + ' ' + operator + ' ' + makeField(field2) + ' ';
    }
  }, {
    key: 'leftJoin',
    value: function leftJoin(table, field1, operator, field2) {
      if (!table || !field2) {
        throw new Error('the arguments error');
      }
      this._join += 'left join ' + makeField(table) + ' on ' + makeField(field1) + ' ' + operator + ' ' + makeField(field2) + ' ';
    }
  }, {
    key: 'orderBy',
    value: function orderBy(fields) {
      if ((typeof fields === 'undefined' ? 'undefined' : _typeof(fields)) !== 'object') throw new Error('The arguments must be an object.');
      var orders = [];
      for (var field in fields) {
        var order = fields[field].toLocaleLowerCase().trim() === 'desc' ? 'desc' : 'asc';
        orders.push(_sqlstring2.default.escapeId(field) + ' ' + order);
      }

      this._order = 'order by ' + orders.join(', ');
    }
  }, {
    key: 'groupBy',
    value: function groupBy(arr) {
      if (!Array.isArray(arr)) throw new Error('The arguments must be an array.');

      this._group = 'group by ' + arr.map(function (e) {
        return _sqlstring2.default.escapeId(e);
      }).join(', ');
    }
  }, {
    key: 'having',
    value: function having() {
      var conditions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var conds = makeWhere(conditions);

      this._having = 'having ' + conds.join(' and ');
    }
  }, {
    key: 'select',
    value: function select(args) {
      var params = [];
      if (Array.isArray(arguments[0])) {
        params = arguments[0];
      } else if (typeof arguments[0] === 'string') {
        params = [];
        for (var i = 0; i < arguments.length; i++) {
          params.push(arguments[i]);
        }
      }
      if (!args) params = ['*'];

      var fields = '';
      if (params) {
        fields = params.map(function (field) {
          return makeField(field);
        }).join(', ');
      } else {
        fields = '*';
      }
      this._fields = fields;
      this._type = 'select';
    }
  }, {
    key: 'insert',
    value: function insert(arr) {
      if ((typeof arr === 'undefined' ? 'undefined' : _typeof(arr)) !== 'object') throw new Error('The arguments must be an array or object.');
      var data = arr;
      if (!Array.isArray(arr)) {
        data = [arr];
      }
      var fields = Object.keys(data[0]);
      var values = data.map(function (item) {
        var value = [];
        for (var i in fields) {
          value.push(_sqlstring2.default.escape(item[fields[i]]));
        }
        return '(' + value.join(', ') + ')';
      }).join(', ');

      this._insert = '(' + fields.map(function (e) {
        return _sqlstring2.default.escapeId(e);
      }).join(', ') + ') values' + values;
      this._type = 'insert';
    }
  }, {
    key: 'update',
    value: function update(data) {
      if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') throw new Error('The arguments must be an object.');
      var items = [];

      for (var key in data) {
        items.push(_sqlstring2.default.escapeId(key) + ' = ' + _sqlstring2.default.escape(data[key]));
      }

      this._update = 'set ' + items.join(', ');
      this._type = 'update';
    }
  }, {
    key: 'delete',
    value: function _delete() {
      this._type = 'delete';
    }
  }, {
    key: 'findAll',
    value: function findAll(conditions) {
      if (!conditions) {
        this.select();
        conditions = {};
      }
      var _conditions = conditions,
          attrs = _conditions.attrs,
          where = _conditions.where,
          orWhere = _conditions.orWhere,
          join = _conditions.join,
          leftJoin = _conditions.leftJoin,
          group = _conditions.group,
          order = _conditions.order,
          having = _conditions.having,
          limit = _conditions.limit,
          offset = _conditions.offset;

      attrs = attrs || ['*'];
      if (attrs) this.select.apply(this, attrs);
      if (where) this.where(where);
      if (orWhere) this.orWhere(orWhere);
      if (join) this.join.apply(this, join);
      if (leftJoin) this.leftJoin.apply(this, leftJoin);
      if (group) this.groupBy(group);
      if (order) this.orderBy(order);
      if (having) this.having(having);
      if (typeof limit !== 'undefined') {
        this.limit(limit, offset);
      }
      return this.toString();
    }
  }, {
    key: 'toString',
    value: function toString(isReload) {
      if (this._sql && isReload) return this._sql;

      var sqls = [];
      switch (this._type) {
        case 'select':
          sqls = ['select ' + this._fields + ' from', this._tableName, this._join, this._where, this._orWhere, this._group, this._having, this._order, this._limit];
          break;
        case 'insert':
          sqls = ['insert into', this._tableName, this._insert];
          break;
        case 'delete':
          sqls = ['delete from', this._tableName, this._where, this._orWhere];
          break;
        case 'update':
          sqls = ['update', this._tableName, this._update, this._where, this._orWhere];
          break;
      }
      return sqls.filter(function (e) {
        return !!e;
      }).join(' ');
    }
  }], [{
    key: 'raw',
    value: function raw(sql) {
      if (typeof sql !== 'string') {
        throw new TypeError('argument sql must be a string');
      }
      return {
        toSql: function toSql() {
          return sql;
        }
      };
    }
  }, {
    key: 'table',
    value: function table(name) {
      if (!name) throw new Error('Table name is not found.');

      var builder = new Builder();
      builder._tableName = makeField(name);

      return builder;
    }
  }, {
    key: 'query',
    value: function query(sql, params) {
      if (!params) return sql;
      var index = 0;
      return sql.replace(/\:(\w+)/g, function (txt, key) {
        if (params.hasOwnProperty(key)) {
          return _sqlstring2.default.escape(params[key]);
        }
        return txt;
      }).replace(/\?/g, function (placeholder) {
        return _sqlstring2.default.escape(params[index++]);
      });
    }
  }, {
    key: 'findAll',
    value: function findAll() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!options.table) throw new Error('options.table is not defined');
      var table = Builder.table(options.table);

      return table.findAll.call(table, options);
    }
  }]);

  return Builder;
}(), (_applyDecoratedDescriptor(_class.prototype, 'table', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, 'table'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'where', [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, 'where'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'orWhere', [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, 'orWhere'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'limit', [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, 'limit'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'join', [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, 'join'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'leftJoin', [_dec6], Object.getOwnPropertyDescriptor(_class.prototype, 'leftJoin'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'orderBy', [_dec7], Object.getOwnPropertyDescriptor(_class.prototype, 'orderBy'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'groupBy', [_dec8], Object.getOwnPropertyDescriptor(_class.prototype, 'groupBy'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'having', [_dec9], Object.getOwnPropertyDescriptor(_class.prototype, 'having'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'select', [_dec10], Object.getOwnPropertyDescriptor(_class.prototype, 'select'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'insert', [_dec11], Object.getOwnPropertyDescriptor(_class.prototype, 'insert'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'update', [_dec12], Object.getOwnPropertyDescriptor(_class.prototype, 'update'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'delete', [_dec13], Object.getOwnPropertyDescriptor(_class.prototype, 'delete'), _class.prototype)), _class));
exports.default = Builder;