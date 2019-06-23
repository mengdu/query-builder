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
  })
  // test('where support operators', () => {
  //   const builder = new Builder('test')
  //   for (const key in builder.$operators) {
  //     expect(!!builder.$operators[key]('test')).toBeTruthy()
  //   }
  // })
})
