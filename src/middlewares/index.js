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
    const { fullName, age } = req.body
    const regex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/

    if (!fullName || !age) {
        return res.status(400).send('Thiếu tên hoặc tuổi!')
    }
    if (typeof fullName !== 'string') {
        return res.status(400).send('Tên chưa đúng!')
    }
    if (!regex.test(fullName)) {
        return res.status(400).send('Tên không hợp lệ!')
    }
    if (typeof age !== 'number') {
        return res.status(400).send('Tuổi chưa đúng!')
    }
    if (age <= 0) {
        return res.status(400).send('Tuổi phải lớn hơn 0!')
    }

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
