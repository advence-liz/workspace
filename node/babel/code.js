const ENV = 'dev'

const arrow = () => {
    console.log(1)
}

try {
    let z = 1
} catch (error) {
    console.log(error)
} finally {
    console.log('eee')
}
var a = new Promise();