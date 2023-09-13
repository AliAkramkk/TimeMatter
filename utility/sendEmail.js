const nodemailer = require("nodemailer")
const User =require('../model/userSchema')
require("dotenv").config()


const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();


const verifyEmail = async (body) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'akramkorakkottil@gmail.com',
                pass: 'zuvlydretngxazpl',
            },
            tls: {
                rejectUnauthorized: false
            }
        });


        const mailOptions = {
            from: process.env.AU_EMAIL,
            to: body.email,
            subject: 'Welcome to TimeMatter',
            html: `<p>Hello <strong>${body.username}</strong>, Please click the link below to verify your Time Matter account. If this is not done by you, you can safely ignore this email.</p><a href="52.66.213.245/${body.username}">Verify now</a>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return 'success';
    } catch (error) {
        console.log(error);
        return 'error';
    }
};
// generate otp,store it in a cookie and send it through an email to the user.
async function sendOTP(req, res, email) {
    try {
      const otp1 = generateOTP();
      // Configure the email transport settings
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.AU_EMAIL,
          pass: process.env.AU_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
  
      // Compose the email message
      const mailOptions = {
        from: process.env.AU_EMAIL,
        to: email,
        subject: 'VerifY  your Email',
        text: `Your OTP: ${otp1}`,
      };
  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      const user = await User.findOne({ email });
      user.otpToken = otp1;
      user.tokenExpires = Date.now() + 300000;
      await user.save();
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
  
  async function resetOTP(req, res, document) {
    try {
      const otp1 = generateOTP();
      res.cookie('otpReset', otp1, { signed: true });
      res.cookie('usernameReset', document.email, { signed: true });
      // Configure the email transport settings
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.AU_EMAIL,
          pass: process.env.AU_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
  
      // Compose the email message
      const mailOptions = {
        from: process.env.AU_EMAIL,
        to: document.email,
        subject: 'Enter this OTP to reset password',
        text: `Your OTP: ${otp1}`,
      };
  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      return otp1;
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }


const changePass = async (body) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'akramkorakkottil@gmail.com',
                pass: 'zuvlydretngxazpl',
            },
            tls: {
                rejectUnauthorized: false
            }
        });


        const mailOptions = {
            from: process.env.AU_EMAIL,
            to: body.email,
            subject: 'Welcome to TimeMatter',
            html: `<p>Hello <strong>${body.username}</strong>, Please click the link below to verify your Time Matter account. If this is not done by you, you can safely ignore this email.</p><a href="52.66.213.245/${body.email}">Verify now</a>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return 'success';
    } catch (error) {
        console.log(error);
        return 'error';
    }
};

// generate otp,store it in a cookie and send it through an email to the user.

module.exports = {
    generateOTP,
    verifyEmail,
    changePass,
     sendOTP,
    resetOTP,
}
