const mongoose = require('mongoose');

const { Schema } = mongoose;

const cartSchema = new Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'product',
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model('Cart', cartSchema);

