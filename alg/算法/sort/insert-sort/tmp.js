console.log(module.i)
function exchange (arr, i, j) {
    let temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
}
function sort (arr = [6, 7, 3, 4, 1, 5, 2]) {
    const len = arr.length

    for (let i = 1; i < len; i++) {
    // if (arr[i] < arr[i - 1]) {
    //   temp = arr[i]
    //   j = i
    //   while (j > 0 && arr[j - 1] > temp) {
    //     arr[j] = arr[j - 1]
    //     j--
    //   }
    //   arr[j] = temp
    // }
        let j
        if (arr[i] < arr[i - 1]) {
            let temp = arr[i]
            for (j = i; j > 0 && arr[j - 1] > temp; j--) {
                arr[j] = arr[j - 1]
            }
            arr[j] = temp
        }
    }

    console.log(arr)
}
sort()

// 工作了这么久有的时候突然发现自己连最基本的东西都没一领悟过
