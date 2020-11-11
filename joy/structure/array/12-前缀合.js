var nums = [0, 1, 2, 2, 3, 4]
let k = 3
let m = {}
let ans = 0

for (let i = 0; i < nums.length; i++) {
    let i_k = nums[i] - k
    ans += ~~m[i_k]
    m[i] = ~~m[i] +1
}

console.log(ans)
// class Solution {
//     public:
//         int numberOfSubarrays(vector<int>& nums, int k) {
//             int n = nums.size();
//             vector<int> arr;
//             arr.push_back(0);
//             for(auto x:nums) arr.push_back(arr.back() + (x&1));

//             unordered_map<int,int> h;
//             int ans = 0;

//             for(auto x:arr) {
//                 ans += h[x-k];
//                 h[x] ++;
//             }
//             return ans;
//         }
//     };
