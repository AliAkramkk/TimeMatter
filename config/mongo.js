require('dotenv').config();
const mongoose = require("mongoose");

const connectMongo = ()=>{

  mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log("Database Connected")
  }).catch((error) => {
    console.log(error.message)
  });

}

module.exports = connectMongo