// eslint-disable-next-line consistent-return
function handleResponse(res, data, err, json) {
    if (err) return res.status(500).json({
        code: 500,
        err: 'Internal Server Error',
    })

    if (data) return res.status(json.code).json(json)
}

module.exports = {
    handleResponse,
}
