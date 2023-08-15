const mongoose=require('mongoose');

const {Schema} = mongoose;

const couponSchema=new Schema({
  couponName: {
      type: String,
      required: true
  },
  discount: {
    type: Number,
    required: true
},
minTotal: {
  type: Number,
  required: true
},
maxDiscount: {
  type: Number,
  required: true
},
user: [{
  type: mongoose.SchemaTypes.ObjectId,
  ref: "User",
 
}],
expiryDate: {
  type: Date,
  required: true
},
},
{ timestamps: true }
);

module.exports=mongoose.model('coupon',couponSchema)