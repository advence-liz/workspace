/**
 * 胃口 g  1,2,7,10
 * 饼 s    1,3,5,9
 */

const g = [1, 2, 7, 10, 12]
const s = [1, 3, 5, 9]

function findContentChildren(g = [1, 2, 3], s = [1, 1]) {
    g.sort((a, b) => a - b)
    s.sort((a, b) => a - b)
    let j = g.length - 1
    let ans = 0
    for (let i = s.length - 1; i >= 0; i--) {
        while (s[i] < g[j] && j >= 0) {
            j--
        }
        if (s[i] >= g[j] && j >= 0) {
            ans++
            g--
        }
    }

    return ans
}

// function findContentChildren(g = [], s = []) {
//     g.sort((a, b) => a - b)
//     s.sort((a, b) => a - b)
//     let j = s.length - 1
//     let ans = 0
//     for (let i = g.length - 1; i >= 0; i--) {
//         if (s[j] >= g[i] && j >= 0) {
//             ans++
//             j--
//         }
//     }

//     return ans
// }

var r = findContentChildren(g)
