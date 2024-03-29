const jsonwebtoken = require('jsonwebtoken')

// eslint-disable-next-line consistent-return
function validateToken(req, res, next) {
    const { authorization } = req.headers
    if (authorization) {
        const token = authorization.split(' ')[1]
        const { key } = req
        try {
            const isValid = jsonwebtoken.verify(token, key, {
                algorithms: ['HS256'],
            })
            if (isValid) {
                res.locals.decodedJWT = isValid
                return next()
            }
        } catch (error) {
            return res.status(401).json({
                err: 'Invalid token',
            })
        }
    } else return res.status(401).json({
        err: 'Invalid token',
    })
}

module.exports = { validateToken }
