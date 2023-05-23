// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer')
require('dotenv').config()

const mailService = {
    async sendMail({
        emailFrom, emailTo, emailSubject, emailText,
    }) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_SERVER,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })

        await transporter.sendMail({
            from: emailFrom,
            to: emailTo,
            subject: emailSubject,
            text: emailText,
        })
    },
}

Object.freeze(mailService)

// mailService.sendMail({
//     emailFrom: 'test@gmail.com',
//     emailTo: 'minhdong43k22@gmail.com',
//     emailSubject: 'Test',
//     emailText: 'Test',
// })

module.exports = {
    mailService,
}
