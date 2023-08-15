const mongoose = require('mongoose');

const { Schema } = mongoose;

const walletSchema = new Schema({
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  credit: {
    type: Number,
  },
  debit: {
    type: Number,
  },
  remaining_amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model('Wallet', walletSchema);
