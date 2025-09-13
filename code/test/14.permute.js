// 1 2 3

//        1
//    2       3
//  3 4 5   2 4 5
function premute(nums) {
  let res = []

  function backTrack(nums, track = []) {
    if (track.length === nums.length) {
      return res.push([...track])
    }

    for (let i = 0; i < nums.length; i++) {
      let n = nums[i]
      if (track.includes(n)) continue
      track.push(n)
      backTrack(nums, track)
      track.pop()
    }
  }

  backTrack(nums, [])
}

/**
 * 1.终止条件
 * 2.横向遍历
 * 3.纵向遍历
 */
