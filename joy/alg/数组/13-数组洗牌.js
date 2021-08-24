function shuffle(arr=[]){

  let n = arr.length
// Math.floor(Math.random()*n)  >> 0 ~ n-1
  while(n!=0){
      n--
      let random = Math.floor(Math.random()*n)
      let tmp = arr[n]
      arr[n] = arr[random]
      arr[random] = tmp

  }
  console.log(arr)
  return arr
}
shuffle([1,2,3,4,5,6])

