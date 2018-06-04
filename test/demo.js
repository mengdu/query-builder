const Builder = require('../index.js')
// const mysql = require('mysql')


// var db = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : '123456',
//   database : 'test'
// })



let query = new Builder()

let sql = query.table('users')
  .select('id', 'nickName')
  .where({
    id: {$gt: 10},
    status: 1
  })
  .orWhere({
    id: 9
  })
  .toString()

console.log(sql)

sql = Builder.findAll({
  table: 'users',
  attrs: ['*'],
  where: {
    id: 10,
    status: 1
  },
  limit: 1,
  offset: 1
})
.toString()

console.log(sql)

sql = Builder.query('select * from users where id = :id and username = :username', {id: 9, username: 'admin'})

console.log(sql)


sql = Builder.query('select * from users where id = ? and username = ?', [9, 'admin'])

console.log(sql)