const run = require('./index.js')

describe('open baidu', () => {
  test('search webdriver', async () => {
    const data = await run()
    expect(data).toEqual('done')
  }, 100000)
})
