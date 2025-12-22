const crypto = require('crypto')


function HashPassword(password) {

    var first_encryption = crypto.createHash('sha256').update(password).digest("hex")
    var second_encryption = crypto.createHash('sha1').update(password).digest("hex")
    return crypto.createHash('md5').update(first_encryption + second_encryption).digest("hex")
}


module.exports.HashPassword = HashPassword;