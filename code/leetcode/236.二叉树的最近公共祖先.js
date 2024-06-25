/*
 * @lc app=leetcode.cn id=236 lang=javascript
 *
 * [236] 二叉树的最近公共祖先
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
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 * dsf 后序 https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/solution/er-cha-shu-de-zui-jin-gong-gong-zu-xian-by-leetc-2/
 *(flson​ && frson​) ∣∣ ((x = p ∣∣ x = q) && (flson​ ∣∣ frson​))
 */

var lowestCommonAncestor = function(root, p, q) {
    let ans = null
    function dfs(root, p, q) {
        if (!root) {
            return false
        }
        let left = dfs(root.left, p, q)
        let right = dfs(root.right, p, q)

        if (
            (left && right) ||
            ((left || right) && (root.val === p.val || root.val === q.val))
        ) {
            ans = root
            // return
        }
        // 返回值为 bool
        return left || right || root.val === p.val || root.val === q.val
    }
    dfs(root, p, q)
    return ans
}
// @lc code=end
