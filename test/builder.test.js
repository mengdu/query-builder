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
