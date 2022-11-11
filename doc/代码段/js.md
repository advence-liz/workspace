## hashcode

<!-- https://www.cnblogs.com/qixing/p/12354378.html -->

```js
function hashCode(str) {
    let h = 0
    const len = str.length
    const t = 2147483647  // 2147483647

    for (let i = 0; i < len; i++) {
        h = 31 * h + str.charCodeAt(i)
        if (h > 2147483647) h %= t // java int溢出则取模
    }
    let r = Number(h)
    r = r % 100
    return r
}

// 可能有负数
// http://www.cppcns.com/wangluo/javascript/333176.html
// https://blog.51cto.com/u_14861909/5439261
hashCode = function(str){
     var hash = 0;
     if (str.length == 0) return hash;
     for (i = 0; i < str.length; i++) {
     char = str.charCodeAt(i);
     hash = ((hash<<5)-hash)+char;
     hash = hash & hash; // Convert to 32bit integer  还是有负数
     }
     return Math.abs(hash);
}
```
测试代码：
```js
// 测试代码
const RandExp = require('randexp')
// const iuuid = new RandExp(/[A-Z0-9]{64}/)
const uuid = new RandExp(/[a-z0-9.]{37}/)
const res = {}
for (let i = 0; i < 100000; i++) {
    // hashCode(iuuid.gen())
    let r = hashCode(uuid.gen())
    if (isNaN(r)) {
        console.log(str)
    }
    if (r < 0 || r > 99) {
        console.log(str, r)
    }
    let cur = r % 10
    if (res[cur] === undefined) {
        res[cur] = 0
    }
    res[cur]++
}
```
