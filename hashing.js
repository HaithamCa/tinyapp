const bcrypt = require('bcryptjs');

const palintextPassword = 'hello';

bcrypt.genSalt(10, (err, salt) => {
    console.log(salt)
    bcrypt.hash(palintextPassword, salt, (err, hash) => {
        console.log(hash)
    })
})



const hashedPassword = "$2a$10$AswftmCNI6X0RneZVmktKOIL0ljF1867m2RwSMZsaEOVs64Btsb.W"
const testPassword = 'hello'

bcrypt.compare(testPassword, hashedPassword, (err, result) => {
    console.log('result:', result)
})