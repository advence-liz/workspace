const { TestCase, TestCaseGroup } = require('./testCase')
// test('2 plus 2 is four', () => {
//   expect(2 + 2).toBe(4)
// })
// test('2 plus 3 is four', () => {
//   expect(2 + 3).toBe(5)
// })
// test('2 plus 4 is four', () => {
//   expect(2 + 4).toBe(6)
// })
// // test('2 plus 5 is four', () => {
// //   expect(2 + 5).toBe(4)
// // })

// test(`0 plus  is four`, () => {
//   expect(0 + 1).toBe(1)
//   expect(0 + 2).toBe(2)
//   expect(0 + 2).toBe(3)
// })

// describe('group1', () => {
//   test('object assignment', () => {
//     const data = { one: 1 }
//     data['two'] = 2
//     expect(data).toEqual({ one: 1, two: 2 })
//   })

//   test('for ', () => {
//     var arr = [1, 2, 3]
//     for (let i = 0; i < arr.length; i++) {
//       expect(i).toBe(i)
//     }
//     //   expect('string').toBe('string')
//     //   expect('string').toEqual('string')
//     //   expect('Christoph').toMatch(/stop/)
//   })
// })

// expect(actual).toBe(expect)

// const myBeverage = {
//   delicious: true,
//   sour: false
// }
const testCaseGroup = new TestCaseGroup({ title: 'root test group' })

const deliciousCase = new TestCase({ hope: true, actual: true, title: 'login' })
const sourCase = new TestCase({ hope: true, actual: true, title: 'valid phone' })
// 添加testCase到root test Group中
testCaseGroup.set('delicious', deliciousCase)
testCaseGroup.set('sour', sourCase)
// 创建subTestGroup并添加到testGroup中
const subTestGroup = new TestCaseGroup({ title: 'sub test guroup' })
subTestGroup.set('sub', new TestCase({ hope: true, actual: true, title: 'sub test group test1' }))
subTestGroup.set('sub2', new TestCase({ hope: true, actual: true, title: 'sub test group test2' }))
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
describe('single case', () => {
  deliciousCase.test()
  sourCase.test()
})

// 组合使用TestCase
testCaseGroup.test()
