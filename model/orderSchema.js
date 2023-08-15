const mongoose = require("mongoose");

const { Schema } = mongoose;

const orderSchema = new Schema({
  order_id: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user",
    required: true,
  },
  product: [
    {
      product_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "product",
      },
      quantity: Number,
    },
  ],

  status: {
    type: String,
    default: "pending",
  },
  total_amount: {
    type: Number,
    required: true,
  },
  payment_method: {
    type: String,
    required: true,
  },
  orderTime: {
    type: Date,
    default: Date.now(),
  },
  address: {
    type: String,
    required: true,
  },
  
   coupon: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "coupon",
   
  },
  netTotal :{
    type:Number,
   
  }
});

module.exports = mongoose.model("Order", orderSchema);
