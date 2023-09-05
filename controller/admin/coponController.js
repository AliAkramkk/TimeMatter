const coupon = require('../../model/coupon');

const addCoupon = async (req,res)=>{
res.render('Admin/addCoupon',{message:""})
}

const newCoupon= async (req,res)=>{
  try{
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
       
} catch (error) {
  res.redirect('/errorPage');
}
  };

  const viewCoupon= async (req,res)=>{

  try{
    const Coupon = await coupon.find({});
    res.render('Admin/coupon',{Coupon})
         
} catch (error) {
  res.redirect('/errorPage');
}
  };

  const viewEditCoupons = async (req, res) => {
    try{
    const _id = req.params.id;
    console.log(_id);
    const coupons = await coupon.findOne({ _id });
    res.render('Admin/editCoupons', { coupons });
         
} catch (error) {
  res.redirect('/errorPage');
}
  };

  const editCoupons = async (req,res)=> {
   try {
   const id =req.body._id;
   const couponName = req.body.name;
   const code = req.body.code;
   const minAmount = req.body.minAmount;
   const discount = req.body.discount;
   const maxDiscountAmount = req.body.maxDiscountAmount;

  const newCoupon = await coupon.findOneAndUpdate({_id:id},{$set:{
    couponName,
    code,
    minTotal:minAmount,
    maxDiscount:maxDiscountAmount,
    discount
  }})
  await newCoupon.save();
  req.flash('success', 'Coupon Updated Succesfully');
    res.redirect("/admin/coupon")
   } catch (error) {
    res.redirect('/errorPage');
   }
  };





module.exports={
  addCoupon,
  newCoupon,
  viewCoupon,
  viewEditCoupons,
  editCoupons

}