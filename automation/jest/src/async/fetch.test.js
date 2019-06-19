const fetchApple = require('./fetch')

test('the data is apple', done => {
  expect.assertions(1)
  const callback = data => {
    expect(data).toBe('apple')
    done()
  }

  fetchApple(callback)
})
