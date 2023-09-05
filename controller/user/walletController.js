const Category = require("../../model/categorySchema");
const Wallet = require("../../model/walletSchema");
const User = require("../../model/userSchema");
const Cart = require("../../model/cartSchema");
const wishlistModel =require("../../model/wishList")
const Razorpay = require('razorpay');
const crypto = require('crypto');



const viewWalletPage = async (req, res) => {
  try{
  const id = req.session.User_id;
  const user = await User.findOne({ _id: id });
  const categories = await Category.find({});
  const documents = await Wallet.find({ user_id: id }).sort({ _id: -1 });
  const carts = await Cart.find({ user: id}).populate("product");
    
  const wishlist = await wishlistModel.findOne({ userId: id }).populate("items");
  res.render('User/wallet', { categories, documents,user,carts,wishlist });
       
} catch (error) {
  res.redirect('/errorPage');
}
};

const addDataWallet = async (req, res) => {
  try {
    const userId =  req.session.User_id;
    const amount = req.body.wallet;
    const razorpayInstance = new Razorpay({
      key_id: 'rzp_test_eVbAVqjcDB8erp',
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: 'INR',
      // receipt: orderId,
    });
    const userDetails = await User.findOne({ _id: userId });

    res.status(201).json({
      success: true,
      options,
      amount,
      userDetails,
    });
  } catch (err) {
    console.error(`Error Online Payment:`, err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

const verifyWalletPayment = async (req, res) => {
  try {
    const userId =  req.session.User_id;
    const { payment } = req.body;
    const walletInc = parseInt(req.body.order.amount / 100);

    let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
    hmac.update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`);
    hmac = hmac.digest('hex');
    if (hmac === req.body.payment.razorpay_signature) {
      await User.updateOne({ _id: userId }, { $inc: { wallet: walletInc } });
      const document = await User.findOne({ _id: userId });
      const wallet = new Wallet({
        user_id: userId,
        debit: walletInc,
        remaining_amount: document.wallet,
      });
      await wallet.save();
      res.status(200).send({
        msg: 'Wallet updated',
      });
    }
  } catch (err) {
    console.error(`Error Verify Online Payment:`, err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
 
module.exports ={
  viewWalletPage,
  addDataWallet,
  verifyWalletPayment

}