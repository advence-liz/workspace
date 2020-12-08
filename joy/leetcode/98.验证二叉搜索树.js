/*
 * @lc app=leetcode.cn id=98 lang=javascript
 *
 * [98] 验证二叉搜索树
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
 * @return {boolean}
 */
var isValidBST = function(root) {
    let pre =null
    function dsf(root){
        if(!root) return true
        if(!dsf(root.left))return false
        if(pre && pre.val >= root.val )  return false
        pre = root
        return dsf(root.right)

    }
    return dsf(root)
}
// @lc code=end

