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
