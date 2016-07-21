import nodemailer from 'nodemailer'
import { emailConfig } from '../config/config.js'
import User from '../Models/User.js'

// Email a user
export function sendEmail(email, subject, text, html){
  let smtpInfo = `smtps://${emailConfig.auth.user}:${emailConfig.auth.pass}@${emailConfig.host}`
  let transporter = nodemailer.createTransport(smtpInfo)

  let mailOptions = {
    from: emailConfig.auth.user,
    to: email,
    subject,
    text,
    html
  }

  transporter.sendMail(mailOptions, (err, info) => {
    if(err) return console.log(err)
    console.log('Message sent: ' + info.response)
  })
}

export function emailUser(username, subject, text, html){
  User.findOne({username}).exec()
    .then(user => {
      sendEmail(user.email, subject, text, html)
    })
}
