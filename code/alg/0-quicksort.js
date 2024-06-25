function quickSort(arr = []) {
    let len = arr.length

    if (len < 2) return arr

    let mid = arr.splice([Math.floor(len / 2)],1)[0]
    let left = []
    let right = []

    for (let v of arr) {
        if (v < mid) {
            left.push(v)
        } else{
            right.push(v)
        }
    }

    return [...quickSort(left), mid, ...quickSort(right)]
}

let r = quickSort([1, 6, 3,3, 2, 4])
console.log(r)
