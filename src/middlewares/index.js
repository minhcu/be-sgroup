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

module.exports = {
    validateUser,
}
