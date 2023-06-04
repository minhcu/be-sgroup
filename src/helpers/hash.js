const crypto = require('crypto')

const saltHash = (password, salt) => {
    // eslint-disable-next-line no-param-reassign
    if (!salt) salt = crypto.randomBytes(16).toString('hex')
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha1').toString('hex')
    return { hashedPassword, salt }
}

const randomPassword = () => {
    const string = crypto.randomBytes(8).toString('hex')
    return string
}

module.exports = {
    saltHash,
    randomPassword,
}
