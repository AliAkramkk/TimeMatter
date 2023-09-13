const mongoose = require('mongoose')
const Schema = mongoose.Schema
const validator = require('validator');
const bcrypt = require('bcrypt');

    
    const userSchema = new Schema({
      username: {
        type: String,
        required: 'Please supply a name',
        trim: true,
      },
      email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: 'Please Supply an email address',
      },
      password: {
        type: String,
        required: true,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
      isAccess: {
        type: Boolean,
        default: true,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      profile: {
        type: String,
        default: "",
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
      address: {
        type: Array,
        default: [],
      },
      wallet: {
        type: Number,
        default: 0,
      },
      wishlist: {
        type: Array,
        default: [],
      }
    });
    
    userSchema.methods.setPassword = async function (newPassword) {
      const saltRounds = 10; // Adjust the number of salt rounds as needed
      this.password = await bcrypt.hash(newPassword, saltRounds);
    };

    module.exports = mongoose.model('user', userSchema);
    
     