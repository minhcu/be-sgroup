const jsonwebtoken = require('jsonwebtoken')

function validateToken(req, res, next) {
    const { authorization } = req.headers
    if (authorization) {
        const token = authorization.split(' ')[1]
        const { key } = req
        try {
            const isValid = jsonwebtoken.verify(token, key, {
                algorithms: ['HS256'],
            })
            if (isValid) next()
        } catch (error) {
            res.status(401).json({
                message: 'Invalid token',
            })
        }
    } else {
        res.status(401).json({
            message: 'Invalid token',
        })
    }
}

module.exports = { validateToken }
