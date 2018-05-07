const Builder = require('./dist').default
const mysql = require('mysql')


var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'test'
})


let b = new Builder({connect: db})

let result = b.table('users')
  .where({
    name: {
      $in: ['admin', 'lisi']
    }
  })
  .orderBy({
    age: 'desc',
    sex: 'asc'
  })
  .groupBy(['name', 'age'])
  .select()
  // .update({
  //   sex: 1,
  //   age: 22
  // })
  // .delete()
  // .select()
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

// db.query(sql, (err, result) => {
//   if (err) throw err
//   console.log(result)

//   db.destroy()
// })
