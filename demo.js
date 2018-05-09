const Builder = require('./index.js')
const mysql = require('mysql')


var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'test'
})



let b = new Builder({connect: db})

let result = b.table('users')
  .join('posts', 'users.id', '=', 'posts.userId')
  .leftJoin('posts as p2', 'users.id', '=', 'p2.userId')
  // .where({
  //   name: {
  //     $in: ['admin', 'lisi']
  //   }
  // })
  // .orderBy({
  //   age: 'desc',
  //   sex: 'asc'
  // })
  // .groupBy(['name', 'age'])
  // .having({
  //   test: {
  //     $gt: 20,
  //     $lt: 40
  //   },
  //   age: 23
  // })

  // .select(['users.name', 'sex as test', 'users.sex as test2', Builder.raw('now() as now')])
  // .select(['*', Builder.raw('age + 1 as test')])
  // .where({
  //   id: 1001
  // })
  // .select(['id', 'name', 'sex'])
  // .limit(100, 10)
  // .update({
  //   sex: 1,
  //   age: 22
  // })
  // .delete()
  .select()
  // .exec()
  // .then((result, fields) => {
  //   console.log(result)
  // })
  // .insert([
  //   {
  //     name: 'lanyue1',
  //     nickName: '测试1',
  //     age: 22,
  //     sex: 1
  //   },
  //   {
  //     name: 'lanyue2',
  //     nickName: '测试2',
  //     age: 22,
  //     sex: 1
  //   },
  //   {
  //     name: 'lanyue3',
  //     nickName: '测试4',
  //     age: 23,
  //     sex: 1
  //   }
  // ])


let sql = b.toString()

console.log(sql)

Builder.log = function (sql) {
  console.log(sql)
}

let sql2 = Builder.findAll({
  connect: db,
  table: 'users',
  attr: ['name', 'age', 'sex'],
  order: {
    age: 'desc'
  },
  limit: 20
})
.exec()
.then(result => {
  console.log(result)
})
.catch(err => {
  console.log('err', err)
})

// console.log(sql2.toString())// select * from users where name = 'test'


// let b2 = Builder.table('users', {connect: db})
//   .orderBy({
//     name: 'desc',
//     age: 'asc'
//   })
//   .select()
//   .exec()
//   .then(result => {
//     console.log(result)
//   })
//   .catch(err => {
//     console.log('err:', err)
//   })

// console.log(b2.toString())
