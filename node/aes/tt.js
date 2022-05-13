const Crypto = require('crypto')
const BaseIv = 'ac6pwxny4wz71860'
const Key = 'Cube'

// aes-128-cbc对称加密
function encrypt(data) {
    let ivKey = Buffer.from(BaseIv, 'utf8')
    let secretKey = Buffer.from(Key, 'utf8')

    secretKey = Crypto.createHash('md5')
        .update(secretKey)
        .digest('hex')

    secretKey = Buffer.from(secretKey, 'hex')

    const cipher = Crypto.createCipheriv('aes-128-cbc', secretKey, ivKey)
    const coder = []
    //  coder.push(cipher.update(data, 'utf8', 'hex'))
    coder.push(cipher.final('hex'))
    return coder.join('')
}

// 加密原始数据
// const data = 'OPENAPI' + String(Date.now())
const data = 'OPENAPI' + String(1652150952564) // 固定值方便验证 OPENAPI1652150952564
// 接口传递数据
const auth = encrypt(data) // 68d5c0b429e6a8a6f31ac6e7c01e163bfa6b816a3eac8bbeff1832f6335840d9
