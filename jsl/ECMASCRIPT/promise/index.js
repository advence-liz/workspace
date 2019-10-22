console.log(module.i)
console.log(1)
try {
  new Promise(function(resolve, reject) {
    console.log(2)
    // resolve()
    throw new Error('ee')
    //                   reject('aaaa')
  }).then(function() {
    throw new Error('then err')
  }).then

//   .catch(err=>{
//     console.log(err)
//   })
} catch (err) {
  console.log('catch', err)
}
console.log(3)

// p.catch(err=>{
//     console.log('promise catch',err)
// })

// p.catch(err=>{
//     console.log(2)
// })
