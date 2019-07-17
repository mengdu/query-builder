# query-builder

A SQL query builder.

## use

```js
import Builder from 'm-query-builder'

const build = new Builder('t_users', 'u')
  .select(['id', 'name', 'sex'])
  .where({
    id: 1001
  })

console.log(buid.toSql()) // select `id`,`name`,`sex` from `t_users` as `u` where `id` = 1001
```

## API

```js
const build = new Builder(tableName [, aliasName]) // 创建一个sql构建；注：toSql后，对象不能重复使用
```

+ **Builder.prototype.select([attrs])** 指定需要查询字段，默认 `['*']`

```js
build.select() // `*`
build.select(['u.userId', 'id', 'name']) // `u`.`userId`,`id`,`name`
```

+ **Builder.prototype.insert(data: Array<{ [key: string]: any }>)** 插入多条数据

```js
build.insert([
  { name: 'zhangsan', age: 24 },
  { name: 'lisi', age: 23 }
]) // insert into table(`name`, `age`) values('zhangsan', 24),('lisi', 23)
```

+ **Builder.prototype.create(data: { [key: string]: any })** 插入一条数据

```js
build.create({ name: 'zhangsan', age: 24 }) // insert into table(`name`, `age`) values('zhangsan', 24)
```

+ **Builder.prototype.update(data: { [key: string]: any })** 更新数据，条件需要连缀 `where` 方法增加条件

+ **Builder.prototype.delete()** 删除数据，条件需要连缀 `where` 方法

+ **Builder.prototype.where(conditions: conditionType)** 条件
+ **Builder.prototype.having(conditions: conditionType)** having 条件

**conditionType** 定义如下

```ts
type conditionType = {
  [key: string]: any,
  $and?: { [key: string]: any }[] | { [key: string]: any },
  $or?: { [key: string]: any }[] | { [key: string]: any },
  $raw?: string
}
```

```js
build.where({ status: 1, age: { $in: [18, 20, 25] } }) // where `status` = 1 and age in (18,20,25)

build.where({
  $and: [
    { age: { $gte: 18 } },
    { age: { $lte: 30 } }
  ]
}) // where `age` >= 18 and `age` <= 30
```

+ **Builder.prototype.order(fields: { [key: string]: orderType | Array<[string, orderType])** 排序

```js
build.order({ createdAt: 'desc', score: 'asc' }) // order by `createdAt` desc, `asc` asc
build.order([ ['createdAt', 'desc'], [ 'score', 'asc' ] ]) // order by `createdAt` desc, `asc` asc
```

+ **Builder.prototype.join(table: string | Builder, opt?: joinOptionType)** 连表查询，支持多次调用
+ **Builder.prototype.joins(arr: joinsOptionType[])** 连表查询，参数为数组

```ts
interface joinsOptionType {
  table: string | Builder,
  as?: string,
  direction?: 'left' | 'right' | 'inner',
  on?: conditionType
}

interface joinOptionType {
  as?: string,
  direction?: 'left' | 'right' | 'inner',
  on?: conditionType
}
```

```js
build.join('t_orders', {
  as: 'o',
  direction: 'left',
  on: { 'o.userId': { $id: 'u.id' } }
}) // left join `t_orders` as o on `o`.`userId` = `u`.`id`
```

+ **Builder.prototype.limit(offset: number = 1, limit: number)** 取部分
+ **Builder.prototype.toSql(alias?: string)** 生成sql


## 操作符

```c
$gt: 10 // > 10
$gte: 10 // >= 10
$lt: 10 // < 10
$lte: 10 // <= 10
$eq: 10 // = 10
$neq: 10 // != 10
$between: [18, 30] // between 18 and 30 
$notBetween: [18, 30] // not between 18 and 30 
$in: [1, 3, 5, 7] // in(1,3,5,7)
$notIn: [1, 3, 5, 7] // not in(1,3,5,7)
$like: 'ab%c' // like 'ab%c'
$notLike: 'ab%c' // not like 'ab%c'
$raw: 'is not null' // is not null
$id: 'u.userId' // = `u`.`userId`
```
