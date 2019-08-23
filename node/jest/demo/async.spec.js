const { TestCase, TestCaseGroup } = require('./testCase')

const testCaseGroup = new TestCaseGroup({ title: 'root test group' })

const deliciousCase = new TestCase({ hope: true, actual: true, title: 'login' })
const sourCase = new TestCase({ hope: true, actual: true, title: 'valid phone' })
// 添加testCase到root test Group中
testCaseGroup.set('delicious', deliciousCase)
testCaseGroup.set('sour', sourCase)
// 创建subTestGroup并添加到testGroup中
const subTestGroup = new TestCaseGroup({ title: 'sub test guroup' })
subTestGroup.set('sub', new TestCase({ hope: true, actual: true, title: 'sub test group test1' }))
subTestGroup.set('sub2', new TestCase({ hope: true, actual: false, title: 'sub test group test2' }))
testCaseGroup.set('subGroup', subTestGroup)

// describe('test group', () => {
//   test('is delicious', () => {
//     // const { hope, actual } = testCaseGroup.get('delicious')
//     // expect(hope).toBe(actual)
//     testCaseGroup.get('delicious').expect()
//   })

//   test('is not sour', () => {
//     testCaseGroup.get('sour').expect()
//   })
// })

// describe('test group 1', () => {
//   test('is delicious', () => {
//     // const { hope, actual } = testCaseGroup.get('delicious')
//     // expect(hope).toBe(actual)
//     testCaseGroup.expect()
//   })
// })
// 单独使用Testcase
// describe('single case', () => {
//   deliciousCase.test()
//   sourCase.test()
// })

// 组合使用TestCase
testCaseGroup.test()
