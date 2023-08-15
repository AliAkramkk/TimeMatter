const coupon = require('../../model/coupon');

const addCoupon = async (req,res)=>{
res.render('Admin/addCoupon',{message:""})
}
const newCoupon= async (req,res)=>{
  const{couponname,discount,minamount,maxdiscount,date}=req.body
  const newcoupon = await coupon({
    couponName: couponname,
    discount:discount,
    minTotal:minamount,
    maxDiscount:maxdiscount,
    expiryDate:date,
  })
  await newcoupon.save()
  res.redirect('/admin/coupon')
  }
  const viewCoupon= async (req,res)=>{
    const Coupon = await coupon.find({});
    res.render('Admin/coupon',{Coupon})
  }
module.exports={
  addCoupon,
  newCoupon,
  viewCoupon,
}