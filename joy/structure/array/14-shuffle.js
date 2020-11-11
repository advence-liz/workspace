function swap(arr, i, j) {
    let tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
}
function shuffle(arr = []) {
    for (let i = arr.length - 1; i >= 0; i--) {
        let randomIndex = Math.floor(Math.random() * (i + 1))
        swap(arr,i, randomIndex)
    }

    console.log(arr)
    return arr
}
shuffle([1,2,3,4,5,6,7,8])