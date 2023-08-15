const nodemailer = require("nodemailer")
require("dotenv").config()


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
            html: `<p>Hello <strong>${body.username}</strong>, Please click the link below to verify your Time Matter account. If this is not done by you, you can safely ignore this email.</p><a href="http://localhost:3003/successemail/${body.username}">Verify now</a>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return 'success';
    } catch (error) {
        console.log(error);
        return 'error';
    }
};



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
            html: `<p>Hello <strong>${body.username}</strong>, Please click the link below to verify your Time Matter account. If this is not done by you, you can safely ignore this email.</p><a href="http://localhost:3003/changepass/${body.email}">Verify now</a>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return 'success';
    } catch (error) {
        console.log(error);
        return 'error';
    }
};


module.exports = {
    verifyEmail,
    changePass
    // sendOTP,
    // generateOTP,
}
