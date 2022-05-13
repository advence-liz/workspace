const Crypto = require('crypto')
const BaseIv = 'ac6pwxny4wz71860'
const Key = 'Cube'
// aes-128-cbc对称解密
function decrypt(data) {
    let ivKey = BaseIv
    let secretKey = Key
    secretKey = Crypto.createHash('md5')
        .update(secretKey)
        .digest('hex')
    secretKey = Buffer.from(secretKey, 'hex')

    const cipher = Crypto.createDecipheriv('aes-128-cbc', secretKey, ivKey)
    const coder = []
    try {
        coder.push(cipher.update(data, 'hex', 'utf8'))
        coder.push(cipher.final('utf8'))
    } catch (e) {
        //
    }
    return coder.join('')
}

// aes-128-cbc对称加密
function encrypt(data) {
    let ivKey = BaseIv
    let secretKey = Key
    secretKey = Crypto.createHash('md5')
        .update(secretKey)
        .digest('hex')

    // console.log(secretKey)
    secretKey = Buffer.from(secretKey, 'hex')

    // console.log(secretKey)

    const cipher = Crypto.createCipheriv('aes-128-cbc', secretKey, ivKey)
    const coder = []
    coder.push(cipher.update(data, 'utf8', 'hex'))
    coder.push(cipher.final('hex'))
    return coder.join('')
}

// 加密原始数据
const data = 'OPENAPI' + String(Date.now())
// 接口传递数据
const auth = encrypt(data) // 68d5c0b429e6a8a6f31ac6e7c01e163bfa6b816a3eac8bbeff1832f6335840d9

const decryptAuth = decrypt(auth) // OPENAPI1652150952564

console.log(auth)

// console.log(decryptAuth)
