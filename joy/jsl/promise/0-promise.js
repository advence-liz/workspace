// ts-check
var p = new Promise(function(resolve, reject) {
    setTimeout(resolve, 1000, 1)
})

p.then(val => {
    console.log(val)
    return 2
})
    .then(val => {
        console.log(val)
        return 3
    })

    .then(val => {
        console.log(val)
        return 4
    })

// function MyPromise(fn) {
//     this.state = 'pending'
//     this.resolveStore = []
//     this.rejectStore = []
//     this.val

//     this.resolve = (val) => {

//     }
//     this.reject=(val) => {
//         this.rejectStore
//     }
//     try {
//         fn(this.resolve, this.reject)
//     } catch (error) {
//         this.reject(error)
//     }
// }
