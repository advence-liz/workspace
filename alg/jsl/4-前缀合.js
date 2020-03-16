var nums =[1,2,3,4]

function preNums(){
    let preNums =[]

    let sum =0
    for(let i =0 ;i<nums.length;i++){
        sum = sum+ nums[i]
        preNums.push(sum)
    }
    console.log(preNums)
}
preNums(nums)