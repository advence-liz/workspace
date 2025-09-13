function reverse(num) {

    let re = ''
    while (num) {
        let cur = num % 10
        re = re + cur
        num = Math.floor(num / 10)
    }

    re = parseInt(re).toString()
    console.log(re)
    return re

}

reverse(120)