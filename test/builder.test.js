const Builder = require('../dest').default

test('test new Builder', () => {
  function run () {
    new Builder()
  }
  expect(run).toThrow()
  expect(run).toThrow(Error)
  expect(run).toThrow(/.*must be a string/)
})

describe('test select', () => {
  test('select()', () => {
    expect(new Builder('test').select().toSql()).toBe('select `*` from `test`')
  })
  test('select([]), select({}) Exception', () => {
    const builder = new Builder('test')

    function run1 () {
      return builder.select([])
    }
    function run2 () {
      return builder.select({})
    }
    expect(run1).toThrow()
    expect(run2).toThrow()
  })

  test('select([...fields])', () => {
    const builder = new Builder('test')

    builder.select(['id', 'name', 'age'])
    expect(builder.$fields).toBe('`id`,`name`,`age`')
    expect(builder.toSql()).toBe('select `id`,`name`,`age` from `test`')
  })

  test('select support alias', () => {
    const builder = new Builder('test')
    builder.select(['name as nickname']).toSql()
    expect(builder.$fields).toBe('`name` as `nickname`')
    builder.select([['name', 'name1']])
    expect(builder.$fields).toBe('`name` as `name1`')

    const builder2 = new Builder('test', 't')
    builder2.select().toSql()
    expect(builder2.$sql).toBe('select `*` from `test` as `t`')
    builder2.select(['t.name', 't.age']).toSql()
    expect(builder2.$sql).toBe('select `t`.`name`,`t`.`age` from `test` as `t`')
    builder2.select(['t.name as name1', ['t.age', 'age1']]).toSql()
    expect(builder2.$sql).toBe('select `t`.`name` as `name1`,`t`.`age` as `age1` from `test` as `t`')
  })

  test('select support raw', () => {
    const builder = new Builder('test')
    builder.select([Builder.raw('count(*)')]).toSql()
    expect(builder.$fields).toBe('count(*)')
    builder.select([Builder.raw('count(*) as count')])
    expect(builder.$fields).toBe('count(*) as count')
    builder.select([[Builder.raw('count(*)'), 'count']])
    expect(builder.$fields).toBe('count(*) as `count`')
  })
})

describe('test where', () => {
  test('where default', () => {
    const builder = new Builder('test')
    builder.where({ id: 1, name: 'abc', status: true, desc: `1' or 1 = 1` })
    expect(builder.$where).toBe('where `id` = 1 and `name` = \'abc\' and `status` = true and `desc` = \'1\\\' or 1 = 1\'')

    builder.where({
      'test.id': 1
    })
    expect(builder.$where).toBe('where `test`.`id` = 1')

    builder.where({
      key: [1, 3, 4]
    })
    expect(builder.$where).toBe('where `key` in (1,3,4)')
  })

  test('where.$and', () => {
    const builder = new Builder('test')
    builder.where({
      $and: { a: 1, b: 2 }
    })
    expect(builder.$where).toBe('where (`a` = 1 and `b` = 2)')

    builder.where({
      test: { $lt: 2 },
      $and: { a: 2 }
    })
    expect(builder.$where).toBe('where `test` < 2 and (`a` = 2)')
  })

  test('where.$or', () => {
    const builder = new Builder('test')
    builder.where({
      $or: { a: 1, b: 2, $and: { c: 1 } }
    })
    expect(builder.$where).toBe('where (`a` = 1 or `b` = 2 or (`c` = 1))')

    builder.where({
      $or: [
        { a: 1 },
        { a: 2 },
        { a: 3 }
      ]
    })
    expect(builder.$where).toBe('where (`a` = 1 or `a` = 2 or `a` = 3)')
  })

  test('where.$raw', () => {
    const builder = new Builder('test')
    builder.where({
      $raw: 'state = 1'
    })
    expect(builder.$where).toBe('where state = 1')

    builder.where({
      $raw: 'state = 1\' or 1 = 1'
    })
    expect(builder.$where).toBe('where state = 1\' or 1 = 1')
  })

  test('where operators', () => {
    const builder = new Builder('test')
    builder.where({
      age: { $gte: 18, $lte: 35 }
    })
    expect(builder.$where).toBe('where `age` >= 18 and `age` <= 35')

    builder.where({
      age: { $eq: 18 },
      status: { $neq: 0 }
    })
    expect(builder.$where).toBe('where `age` = 18 and `status` != 0')

    builder.where({
      age: { $between: [18, 35] },
    })
    expect(builder.$where).toBe('where `age` between 18 and 35')

    builder.where({
      key: { $like: 'str_%' },
      kw: { $notLike: '%a%' }
    })
    expect(builder.$where).toBe('where `key` like \'str_%\' and `kw` not like \'%a%\'')

    builder.where({
      id: { $raw: '= (select id form users limit 1)' }
    })
    expect(builder.$where).toBe('where `id` = (select id form users limit 1)')

    builder.where({
      'user.id': { $id: 'post.userId' }
    })
    expect(builder.$where).toBe('where `user`.`id` = `post`.`userId`')
  })
})

describe('test delete', () => {
  test('delete', () => {
    const builder = new Builder('t')
    builder.delete()
    expect(builder.toSql()).toBe('delete from `t`')
    
    builder.where({ id: 1 }).delete()
    expect(builder.toSql()).toBe('delete from `t` where `id` = 1')
  })
})

describe('test update', () => {
  test('update', () => {
    const builder = new Builder('t')

    function run () {
      builder.update()
    }

    function run2 () {
      builder.update([])
    }

    function run3 () {
      builder.update([])
    }

    expect(run).toThrow()
    expect(run2).toThrow()
    expect(run3).toThrow()
    
    builder.update({ age: 20 })
    expect(builder.toSql()).toBe('update `t` set `age` = 20')

    builder.update({ age: 25, name: 'test' })
    expect(builder.toSql()).toBe('update `t` set `age` = 25,`name` = \'test\'')
  })
})

describe('test insert', () => {
  test('create', () => {
    const builder = new Builder('t')

    function run () {
      builder.create()
    }

    function run2 () {
      builder.create({})
    }

    expect(run).toThrow()
    expect(run2).toThrow()

    builder.create({ name: 'test', age: 18, status: 1 })
    expect(builder.toSql()).toBe('insert into t(`name`,`age`,`status`) values(\'test\',18,1)')
  })

  test('insert', () => {
    const builder = new Builder('t')

    function run () {
      builder.insert()
    }

    function run2 () {
      builder.insert([])
    }

    function run3 () {
      builder.insert([{}])
    }

    expect(run).toThrow()
    expect(run2).toThrow()
    expect(run3).toThrow()

    builder.insert([
      { name: 'test', age: 18 },
      { name: 'test2', age: 20 }
    ])
    expect(builder.toSql()).toBe('insert into t(`name`,`age`) values(\'test\',18),(\'test2\',20)')
  })
})

describe('test limit', () => {
  test('limit default', () => {
    const builder = new Builder('t')

    builder.select().limit()
    expect(builder.toSql()).toBe('select `*` from `t` limit 1')

    builder.select().limit(1000)
    expect(builder.toSql()).toBe('select `*` from `t` limit 1000')
  })
  test('limit n,m', () => {
    const builder = new Builder('t')

    builder.select().limit(10, 1000)
    expect(builder.toSql()).toBe('select `*` from `t` limit 10, 1000')
  })
})

describe('test order by', () => {
  test('order { key: type }', () => {
    const builder = new Builder('t')

    builder.select().order({ age: 'DESC' })
    expect(builder.toSql()).toBe('select `*` from `t` order by `age` desc')

    builder.select().order({ age: 'DESC', name: 'ASC' })
    expect(builder.toSql()).toBe('select `*` from `t` order by `age` desc,`name` asc')
  })

  test('order [key, type]', () => {
    const builder = new Builder('t')

    builder.select().order([['age', 'desc' ]])
    expect(builder.toSql()).toBe('select `*` from `t` order by `age` desc')

    builder.select().order([['name', 'asc'], ['age', 'desc']])
    expect(builder.toSql()).toBe('select `*` from `t` order by `name` asc,`age` desc')
  })
})

describe('test group by', () => {
  test('group', () => {
    const builder = new Builder('t')

    builder.group([ 'age' ])
    expect(builder.$groupBy).toBe('group by `age`')

    builder.group([ 'age', 'id' ])
    expect(builder.$groupBy).toBe('group by `age`,`id`')
  })
})

describe('test join', () => {
  test('join throw', () => {
    const builder = new Builder('t')

    function run () {
      builder.join()
    }

    expect(run).toThrow()
  })
  
  test('join("table")', () => {
    const builder = new Builder('t')
    builder.select().join('user')
    expect(builder.toSql()).toBe('select `*` from `t` join `user`')
  })

  test('join("table", {on: {}})', () => {
    const builder = new Builder('t')
    builder.select().join('user', { on: { 'user.id': { $id: 't.id' } } })
    expect(builder.toSql()).toBe('select `*` from `t` join `user` on `user`.`id` = `t`.`id`')
  })

  test('join("table", { on, as, direction })', () => {
    const builder = new Builder('t')
    builder.select().join('users', { on: { 'u.id': { $id: 't.id' } }, as: 'u', direction: 'right' })
    expect(builder.toSql()).toBe('select `*` from `t` right join `users` as `u` on `u`.`id` = `t`.`id`')
  })

  test('join(Builder', () => {
    const builder = new Builder('t')
    const b2 = new Builder('users')
    b2.select()

    builder.select().join(b2)
    expect(builder.toSql()).toBe('select `*` from `t` join (select `*` from `users`)')
  })


  test('join multiple', () => {
    const builder = new Builder('t')
    builder.select().join('test', { as: 't1', on: { 't1.status': 1 } }).join('user', { on: { 'u.id': { $id: 't.id' } }, as: 'u', direction: 'right' })
    expect(builder.toSql()).toBe('select `*` from `t` join `test` as `t1` on `t1`.`status` = 1 right join `user` as `u` on `u`.`id` = `t`.`id`')
  })

  test('joins', () => {
    const builder = new Builder('t')
    builder.select().joins([{ table: 'users' }])
    expect(builder.toSql()).toBe('select `*` from `t` join `users`')

    const b2 = new Builder('t')
    b2.select().joins([{ table: 'users1' }, { table: 'users2' }])
    expect(b2.toSql()).toBe('select `*` from `t` join `users1` join `users2`')

    const b3 = new Builder('t')
    b3.select().joins([{ table: 'users1', as: 'u1', direction: 'left' }, { table: 'users2', as: 'u2', direction: 'right' }])
    expect(b3.toSql()).toBe('select `*` from `t` left join `users1` as `u1` right join `users2` as `u2`')
  })
})
