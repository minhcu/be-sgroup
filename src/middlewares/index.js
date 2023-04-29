function validateEmail(email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    return emailRegex.test(email)
}

function validateString(str, len = 3) {
    return str.length >= len
}

function validatePassword(password, confirmPassword) {
    const result = validateString(password) && password === confirmPassword
    return result
}

function validateUser(req, res, next) {
    const { name, age } = req.body
    const regex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/

    const validate = validateString(name) && typeof age === 'number' && regex.test(name)

    if (!validate) return res.status(400).send('Invalid input')

    return next()
}

function validateRegister(req, res, next) {
    const {
        username,
        password,
        confirmPassword,
        email,
        name,
    } = req.body

    // eslint-disable-next-line max-len
    const validate = validateEmail(email) && validatePassword(password, confirmPassword) && validateString(username) && validateString(name, 2)

    if (!validate) return res.status(400).send('Invalid input')

    return next()
}

function validateLogin(req, res, next) {
    const { username, password } = req.body
    const validate = validateString(username) && validateString(password)
    if (!validate) return res.status(400).send('Invalid input')
    return next()
}

module.exports = {
    validateUser,
    validateRegister,
    validateLogin,
}
