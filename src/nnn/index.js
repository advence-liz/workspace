let arr = [3, 4, 1, 7, 9, 11, 5]

function swap (s, t, arr) {
  let tmp = arr[s]
  arr[s] = arr[t]
  arr[t] = tmp
}

function bubble (arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(j, j + 1, arr)
      }
    }
  }
}
// bubble(arr)
// console.log(arr)

function select (arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i; j < arr.length; j++) {
      let min = i
      if (arr[j] < arr[min]) {
        min = j
      }
      swap(i, min, arr)
    }
  }
}
select(arr)
console.log(arr)
console.log(11)