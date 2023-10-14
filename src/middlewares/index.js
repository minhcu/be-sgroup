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
    const { email } = req.body
    const { gender } = req.body
    let validate = true
    // eslint-disable-next-line max-len
    if (name) {
        const regex = /^[0-9a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/
        validate = validateString(name) && regex.test(name)
    }
    if (email) validate = validate && validateEmail(email)
    if (age) validate = validate && (age && age >= 0)
    if ((gender !== null || gender < 0) && gender !== undefined) validate = false

    if (!validate) return res.status(400).send({
        err: 'Invalid input',
    })

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
    if (!validate) return res.status(400).send({
        err: 'Invalid Input',
    })
    return next()
}

function validateEmailPass(req, res, next) {
    const { email } = req.body
    const validate = validateEmail(email)
    if (!validate) return res.status(400).send('Invalid input')
    return next()
}

module.exports = {
    validateEmailPass,
    validateUser,
    validateRegister,
    validateLogin,
}
