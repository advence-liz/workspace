const run = require('./index.js')

describe('monkey test', () => {
  test('search webdriver', async () => {
    const monkeyErrors = await run()
    expect(monkeyErrors.count).toEqual(2)
  }, 100000)
})
