function traverse(arr, index) {
    if (index === arr.length) {
        return
    }

    var val = arr[index]

    console.log(val)

    traverse(arr, index + 1)
}

traverse([1, 2, 3, 4, 5], 0)
