console.log(module.i)
function exchange (arr, i, j) {
    let tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
}
function sort (arr = [6, 7, 3, 4, 1, 5, 2]) {
    const len = arr.length

    for (let i = 1; i < len; i++) {
        let j = i
        while (j > 0 && arr[j] < arr[j - 1]) {
            exchange(arr, j, j - 1)
            j--
        }
    }
    //     for (let j = i; j > 0 && arr[j] < arr[j - 1]; j--) {

    //       //   if (arr[j] < arr[j - 1]) exchange(arr, j, j - 1)
    //     }
    //   }

    console.log(arr)
}
sort()
