function moveZeroToLast(arr) {
    let index = 0
    for (let i = 0, length = arr.length; i < length; i++) {
        if (arr[i] === 0) {
            index++
        } else if (index !== 0) {
            arr[i - index] = arr[i]
            arr[i] = 0
        }
    }
    console.log(arr)
    return arr

}
moveZeroToLast([0,1,1,0,1,2])