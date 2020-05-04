const { treeDeep } = require('./bintree-deep')
const createTree = require('../tuil/d-t')
/**
 *        10
 *    5          15
 * 3     6    12     16
 * 10 5 3 6 15 12 16
 * 3 6 5 12 16 15 10
 */
let root = createTree([10, 5, 3, 6, 15, 12, 16])

test('tree deep is 3', () => {
    expect(treeDeep(root)).toBe(3)
})
