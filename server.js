require('dotenv').config()
const express = require('express')
const app = express()
const user = require("./router/user")
const admin = require("./router/admin")
const session = require('express-session')
const cloudinary = require('cloudinary').v2;
const flash = require("connect-flash")
const fileUpload = require('express-fileupload')
const mongo = require('./config/mongo');


mongo()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})


app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))


app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    limits: { fileSize: 50 * 2024 * 1024 }
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: { sameSite: 'strict' },
    saveUninitialized: true,
    resave: false
}))

app.use(flash());

app.use((req, res, next) => {
    res.locals.flashes = req.flash();
    next();
  });
  

app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
    res.header('Expires', '0');
    res.header('Pragma', 'no-cache');
    next();
});


app.use("/admin", admin)
app.use("/", user)


app.listen(process.env.PORT, () => {
    console.log("server started at " + process.env.PORT);
})