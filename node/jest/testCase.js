class TestCase {
  /**
     *
     * @prop {any} hope 预期值（expect被占用了)
     * @prop {any} actual 实际值
     * @prop {string} assert 断言默认'toBe'即jest中的matchers
     * @prop {string} title 测试用例标题
     */
  constructor ({ hope, actual, assert, title } = {}) {
    this.title = title
    this.hope = hope
    this.assert = assert || 'toBe'
    this.actual = actual
    this.type = 0
  }
  expect () {
    const { hope, actual, assert } = this
    expect(hope)[assert](actual)
  }
  test () {
    test(this.title, () => {
      this.expect()
    })
  }
}

class TestCaseGroup extends TestCase {
  constructor (opts) {
    super(opts)
    this.cases = new Map()
    this.type = 1
  }
  set (name, testCase) {
    this.cases.set(name, testCase)
  }
  get (name) {
    return this.cases.get(name)
  }
  test () {
    describe(this.title, () => {
      this.cases.forEach(testCase => {
        testCase.test()
      })
    })
  }
//   describe () {
//     describe(this.name, () => {
//       this.test()
//     })
//   }
}

module.exports = {
  TestCase, TestCaseGroup
}
