const Builder = require('./dist').default

// console.log(Builder)

let b = new Builder()

console.log(b.table('xxx'))
console.log(b)

b.where()
