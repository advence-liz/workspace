/**
 * [1,2,3,4,5,6]
 * 
 * target = 7
 * 
 */

function twoSum(nums=[],target){
    // {num: index}
    // 2. 
    let m = new Map()

    let res = []

    for(let i = 0;i < nums.length;i++ ){


        let n = nums[i]
        m.set(n,i)

        if(m.has(target-n)){

            res.push([i,m.get(target-n)]) 

        }


    }
    return res

}

var r = twoSum([1,2,3,4,5],7)

console.log(r)
