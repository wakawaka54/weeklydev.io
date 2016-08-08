import nodemailer from 'nodemailer'
import config from 'config';
import User from '../Models/User.js'

// Email a user
export function sendEmail(email, subject, text, html){
  if (!config.has('email.auth')) {
    console.log('No email config found, not sending email.')
    return;
  }
  let smtpInfo = `smtps://${config.get('email.auth.user')}:${config.get('email.auth.pass')}@${config.get('email.host')}`;
  let transporter = nodemailer.createTransport(smtpInfo)

  let mailOptions = {
    from: config.get('email.auth.user'),
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
    .catch(err => {
      console.log('Could not find the user to email:', err)
    })
}
