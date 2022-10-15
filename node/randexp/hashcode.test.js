function hashCode(str) {
    let h = 0
    const len = str.length
    const t = 2147483648
    for (let i = 0; i < len; i++) {
        h = 31 * h + str.charCodeAt(i)
        if (h > 2147483647) h %= t // java int溢出则取模
    }
    let r = Number(h)
    if (isNaN(r)) {
        console.log(str)
    }
    r = r % 100
    if (r < 0 || r > 99) {
        console.log(str,r)
    }
    // console.log(r)
    return r
}

const RandExp = require('randexp')

const iuuid = new RandExp(/[A-Z0-9]{64}/)
const uuid = new RandExp(/[a-z0-9.]{37}/)

for(let i = 0;i< 100000;i++){
    hashCode( iuuid.gen())
    hashCode( uuid.gen())

}

// hashCode('3ZVS8ACXRU7HBRBQIYSZELYZM0GXBD733OAMRUKC2UISLR0TB9MBSYQKOPS1CL0X')
