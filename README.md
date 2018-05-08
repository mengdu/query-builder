# query-builder

A SQL query builder.

## use

```js
import Builder from 'query-builder'

let sql = Builder.table('users')
  .select(['id', 'name', 'sex'])
  .where({
    id: 1001
  })
  .toString()

console.log(sql) // select `id`, `name`, `sex` from `users` where `id` = 1001

```

## api

原型方法

+ table(tableName, options) 指定表名，options.connect可以配置mysql连接，为exec使用。 返回Builder
+ where(conditions) 条件
+ join(table, field1, operator, field2) 连接查询
+ letJoin(table, field1, operator, field2) 左连接
+ orderBy({age: 'desc'}) 排序
+ groupBy(['type']) 分组
+ having(conditions)
+ select(['field1',...]) 列出字段
+ insert(arr) 数据数组
+ update(obj) 更新
+ delete()
+ exec() 执行sql，返回Promise 需要配置 `options.connect` 数据库连接
+ toString() 返回sql

静态方法

+ Builder.query(sql, params)
+ Builder.raw(sql) 用于select函数里的一些特殊查询，如果调用系统函数
+ Builder.table(table, options) 返回Builder

**Builder.query**

```js
let sql = Builder.query('select * from users where name = :name', {name: 'test'})

console.log(sql)// select * from users where name = 'test'
```

