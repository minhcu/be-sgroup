function validateUser(req, res, next) {
    const { fullname, age } = req.body
    const regex = RegExp(/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/)

    if (!fullname || !age) {
        return res.status(400).send('Thiếu tên hoặc tuổi!')
    }
    if (typeof fullname !== 'string') {
        return res.status(400).send('Tên chưa đúng!')
    }
    if (!regex.test(fullname)) {
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
    validateUser
}