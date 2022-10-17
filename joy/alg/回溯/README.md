# 回溯

- 主逻辑构建一下虚拟的根节点
  
递归执行顺序等同 dsf  先序列遍历  根 -> 左右 （子节点由左及右）


回溯是递归的副产品，只要有递归就会有回溯。
所以以下讲解中，回溯函数也就是递归函数，指的都是⼀个函数。
https://blog.csdn.net/Mcdull__/article/details/116913380

递归顺序
自顶向下
自左向右
子节点自左向右回溯

减枝

记忆化递归  必须纯函数 自顶向下加  tracks paths 不行

```js
 1          1      1
2 3       2      2 3 4
```

```js
var permute = function(nums) {
    let res = []
    function dsf(nums, track = []) {
        // 1.终止条件
        if (track.length === nums.length) {
            res.push(track.slice())
        }

        for (let i = 0; i < nums.length; i++) {
            if (!track.includes(nums[i])) {
                // 2.处理根节点
                track.push(nums[i]) 
                // 3.遍历子节点
                dsf(nums, track)
                // 4. 回溯
                track.pop() 
            }
        }
    }
    dsf(nums, [])
    return res
}
function dsf (root,paths){
    // 1.终止条件
    if(!root) return 
    // 2.处理根节点
    paths.push(root.val)
    // 3.遍历子节点
    dsf(root.left)
    dsf(root.right)
    // 4. 回溯
    paths.pop()

}
```