/*
 * @lc app=leetcode.cn id=257 lang=javascript
 *
 * [257] 二叉树的所有路径
 */

// @lc code=start
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {string[]}
 */
var binaryTreePaths = function(root) {

    let res =[]

    function dsf(root,route=[]){
        route.push(root.val)
        if(root.left){dsf(root.left,route)}
        if(root.right){dsf(root.right,route)}
        if(!root.left&&!root.right){
            res.push(route.join('->'))
        }
        route.pop()

    }
    dsf(root,[])
    return res

}
// @lc code=end

