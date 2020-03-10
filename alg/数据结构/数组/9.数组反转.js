function reverse(arr = []) {
    let len = arr.length
    for (let i = 0; i < Math.floor(len / 2); i++) {
        [arr[i], arr[len - i - 1]] = [arr[len - i - 1], arr[i]]
    }
    console.log(arr)
    return arr
}
reverse([1, 2, 3])
