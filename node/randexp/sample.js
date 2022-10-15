const RandExp = require('randexp')
const randexp = new RandExp(/[a-z]{6}/)
console.log(randexp.gen())
console.log(randexp.gen())
console.log(randexp.gen())
const phone = new RandExp(/1110000[\d]{4}/)
console.log(phone.gen())
console.log(phone.gen())
console.log(phone.gen())
//BCDCBF238D77BC26E976415409A8858DE1983531B85F74E2150A5AC880DD3DC1
const iuuid = new RandExp(/[A-Z0-9]{64}/)
const uuid = new RandExp(/[a-z0-9.]{37}/)
// 48aa8cf8c7eb4e70ae43.1652012051.1.0.0
console.log(uuid.gen())