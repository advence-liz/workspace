// 原始 list 如下
let list = [
    { id: 1, name: '部门A', parentId: 0 },
    { id: 2, name: '部门B', parentId: 0 },
    { id: 3, name: '部门C', parentId: 1 },
    { id: 4, name: '部门D', parentId: 1 },
    { id: 5, name: '部门E', parentId: 2 },
    { id: 6, name: '部门F', parentId: 3 },
    { id: 7, name: '部门G', parentId: 2 },
    { id: 8, name: '部门H', parentId: 4 }
]

function convert(list) {
    let m = {}
    let result = []
    for (let x of list) {
        let curParentId = x.parentId
        if (m[curParentId] === undefined) {
            m[curParentId] = [x]
        } else {
            m[curParentId].push(x)
        }
    }

    for (let item of list) {
        item.children = m[item.id]
        if (item.parentId === 0) result.push(item)
    }
    console.log(result)
}

const result = convert(list)
