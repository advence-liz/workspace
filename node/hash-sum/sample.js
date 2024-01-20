const hashSum = require('hash-sum')

class Ann {
    constructor(d) {
        this.d = d
    }
}
const hashSet = new Set()

for (let i = 0; i < 100; i++) {
    const s = hashSum({ a: {}, b: {} })
    // if (hashSet.has(s)) {
    //     console.log(s)
    //     return
    // }
    console.log(s)
    hashSet.add(s)
}
