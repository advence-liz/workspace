# 回溯

- 主逻辑构建一下虚拟的根节点
  
递归执行顺序等同 dsf

子节点自左向右回溯

```js
 1          1      1
2 3       2      2 3 4
```

```js
var permute = function(nums) {
    let res = []
    function dsf(nums, track = []) {
        if (track.length === nums.length) {
            res.push(track.slice())
        }

        for (let i = 0; i < nums.length; i++) {
            if (!track.includes(nums[i])) {
                track.push(nums[i])
                dsf(nums, track)
                track.pop()
            }
        }
    }
    dsf(nums, [])
    return res
}
```