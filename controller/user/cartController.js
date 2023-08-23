const objectId = require("mongoose").Types.ObjectId;
const Cart = require("../../model/cartSchema");
const Product = require("../../model/productSchema");
const User = require("../../model/userSchema");
const Category = require("../../model/categorySchema");
const Order = require("../../model/orderSchema");
const Coupon = require("../../model/coupon")
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Wallet =require('../../model/walletSchema');
const wishlistModel =require("../../model/wishList");




const addToCart = async (req, res) => {
  const userId = req.session.User_id;
  const productId = req.query.productId;
  // if (req.user.wishlist) {
  //   await User.updateOne({ _id: userId }, { $pull: { wishlist: productId } });
  // }
  // const wishlistSize = req.user.wishlist.length - 1;
  const existingProduct = await Cart.findOne({
    user: userId,
    product: productId,
  });
  if (existingProduct) {
    await Cart.findOneAndUpdate(
      { user: userId, product: productId },
      { $inc: { quantity: 1 } }
    );
  } else {
    const newCart = new Cart({
      user: userId,
      product: productId,
    });
    await newCart.save();
  }
  res.json({ success: true });
};

function totalAmount(products) {
  let totalPrice = 0;
  for (let i = 0; i < products.length; i++) {
    const document = products[i];
    totalPrice += document.product.price * document.quantity;
  }
  return totalPrice;
}

const getCart = async (req, res) => {
  try {
    const user = req.session.User_id;
    if (user) {
   
      const categories = await Category.find({});
      const carts = await Cart.find({ user: user }).populate("product");
   
      const count = await Cart.find({ user: user }).count();
      const total = totalAmount(carts);
      const wishlist = await wishlistModel.findOne({ userId: user }).populate("items");
      const coupon = await Coupon.find({});
   
    
      res.render("User/cart", { categories, carts, count, total, user,wishlist,coupon });
    } else {
      req.flash("error", "Please login to purchase products");
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCartItems = async (req, res) => {
  const cartId = req.params.id;
  const product = await Cart.findOne({ _id: cartId }).populate("product");
  await Cart.findByIdAndDelete(cartId);
  const carts = await Cart.find({ user: req.session.User_id }).populate(
    "product"
  );
  const count = await Cart.findOne({ user: req.session.User_id }).count();

  const total = totalAmount(carts);
  res.send({
    data: "this is data",
    count,
    total,
    product,
  });
};

const incrementCartItems = async (req, res) => {
  const userId = req.session.User_id;
  const { cartId } = req.query;
 
  
  // const availableProduct = await Product.findOne({_id:prodId})
  const prod = await Cart.findOne({ _id: cartId }).populate("product");
    if(prod.product.quantity>prod.quantity){ 
       await Cart.findOneAndUpdate({ _id: cartId }, { $inc: { quantity: 1 } });
      }

  const product = await Cart.findOne({ _id: cartId }).populate("product");
  const carts = await Cart.find({ user: userId }).populate("product");
  const count = await Cart.find({ user: userId }).count();
  const total = totalAmount(carts);
  
  const newPrice = parseInt(product.product.price * product.quantity);

  res.send({
   
    carts,
    count,
    total,
    newPrice,
    product,
  });
};

const decrementCartItems = async (req, res) => {
  let quantityZero = false;
  const userId = req.session.User_id;
  const { cartId } = req.query;
  await Cart.findOneAndUpdate({ _id: cartId }, { $inc: { quantity: -1 } });
  const carts = await Cart.find({ user: userId }).populate("product");
  const total = totalAmount(carts);
  const product = await Cart.findOne({ _id: cartId }).populate("product");
  if (product.quantity <= 0) {
    await Cart.deleteOne({ _id: cartId });
    quantityZero = true;
  }
  const count = await Cart.find({ user: userId }).count()
  const newCount=count
  const newPrice = parseInt(product.product.price * product.quantity);
  res.send({

    quantityZero,
    carts,
    count,
    total,
    newPrice,
    product,
    newCount
  });
};
const checkQuantity = async (req, res) => {
  const carts = await Cart.find({ user: req.session.User_id }).populate("product");
  // let insufficientStock = false;
  // carts.forEach((document) => {
  //   if (document.quantity > document.product.quantity) {
  //     insufficientStock = true;
  //   }
  // });
  // if (insufficientStock) {
  //   req.flash('message', 'Product with no stock selected');
  //   return res.redirect('/cart');
  // }
  // res.redirect('/checkOut');
  // const {couponName,discountPrice,productPrice,updatedPrice}=req.query
  res.send({ data: "this is data" });
};

const getCheckOut = async (req, res) => {
  const {code,discountPrice,productPrice,updatedPrice}=req.query;
  console.log(code);
  const userId = req.session.User_id;
  const user = await User.findOne({ _id: userId });
  const address = user.address;

  const carts = await Cart.find({ user: userId }).populate("product");
  const wishlist = await wishlistModel.findOne({ userId: userId }).populate("items");
  const categories = await Category.find({});
  const total = totalAmount(carts);
  res.render("User/checkOut", { categories, address, total, user,code,discountPrice,productPrice,updatedPrice,carts,wishlist });
};

const checkout = async (req, res) => {
  const {productPrice,updatedPrice,discountPrice,code} = req.body;
  if (req.body.payment === 'wallet') {
    const userId = req.session.User_id;
    const id = req.session.User_id;
    const user =await User.findOne({_id:userId});
    const walletAmount =user.wallet;
   
    const remainingAmount = walletAmount - req.body.totalAmount;
    if(req.body.totalAmount>walletAmount){
      return res.status(400).send({ message: 'Not enough cash in wallet' });
    }
    if(remainingAmount<0){
      await User.findOneAndUpdate(id,{
        $set:{
          wallet:0,
        },
      });
      const wallet = new Wallet({
        user_id:userId,
        credit:req.body.totalAmount,
        remaining_amount: 0,
      })
      await wallet.save();
    }else{
      await User.findByIdAndUpdate(id,{
        $set:{
          wallet:parseInt(remainingAmount)
        },
      });
      const wallet = new Wallet({
        user_id: userId,
        credit: req.body.totalAmount,
        remaining_amount: remainingAmount,
      });
      await wallet.save();
    }
    if (code) {
      const couponInfo = await Coupon.findOne({ code: code });
      if (!couponInfo) {
        return res.status(400).send({ message: 'Coupon name not valid' });
      }
      couponInfo.user.push(userId);
      await couponInfo.save();
    }
    const cartItems = await Cart.find({ user: userId });
    const productArray = cartItems.map((item) => ({
      product_id: item.product,
      quantity: item.quantity,
    }));
    for (const item of productArray) {
      const productId = item.product_id;
      const { quantity } = item;
      await Product.findOneAndUpdate(
        { _id: productId },
        { $inc: { stock: -quantity } }
      );
    }
    const lastOrder = await Order.find().sort({ _id: -1 }).limit(1);
    let orderId = 'EMRT000001';
    if (lastOrder.length > 0) {
      const lastOrderId = lastOrder[0].order_id;
      const orderIdNumber = parseInt(lastOrderId.slice(4));
      orderId = `EMRT${`000000${orderIdNumber + 1}`.slice(-6)}`;
    }

    const newOrder = new Order({
      order_id: orderId,
      user: userId,
      product: productArray,
      address: req.body.address,
      total_amount: req.body.totalAmount,
      payment_method: 'wallet',
    });
    if (code) {
      newOrder.coupon_used = code;
    }
    await newOrder.save();
    await Cart.deleteMany({ user: userId });
    res.status(200).send({
      msg: 'Order placed',
    });

  }


  if (req.body.payment === "cod") {
    const userId = req.session.User_id;
    const {productPrice,updatedPrice,discountPrice,code} = req.body;
    const productPrice1=parseInt(productPrice)
    const updatedPrice1=parseInt(updatedPrice)
   
   
  // await Coupon.findOneAndUpdate({ couponName:couponName},{$addtoset:{user:userId}})
  
    const cartItems = await Cart.find({ user: userId });
    const productArray = cartItems.map((item) => ({
      product_id: item.product,
      quantity: item.quantity,
    }));
    
  
    for (const item of productArray) {
      const id = item.product_id;
      const { quantity } = item;
      await Product.findOneAndUpdate(
        { _id: id },
        { $inc: { quantity: -quantity } }
      );
    }
    const lastOrder = await Order.find().sort({ _id: -1 }).limit(1);
    let orderId = "EMRT0 00001";
    if (lastOrder.length > 0) {
      const lastOrderId = lastOrder[0].order_id;
      const orderIdNumber = parseInt(lastOrderId.slice(4));
      orderId = `EMRT${`000000${orderIdNumber + 1}`.slice(-6)}`;
    }
    if(code!=""){
     
        const couponId = await Coupon.findOne({code:code});
        console.log(couponId);
    
      var newOrder = new Order({
        order_id: orderId,
        user: userId,
        product: productArray,
        address: req.body.address,
        total_amount: productPrice1,
        payment_method: "COD",
        coupon:couponId._id,
        
        netTotal:updatedPrice1,
         
      });
    }else{
      var newOrder = new Order({
        order_id: orderId,
        user: userId,
        product: productArray,
        address: req.body.address,
        total_amount: productPrice1,
        payment_method: "COD",
       
        
        netTotal:updatedPrice1,
         
      });
    }
   
    
    await newOrder.save();
    await Cart.deleteMany({ user: userId });
    res.status(200).send({
      msg: "Order placed",
    });
  }
  if (req.body.payment === 'online') {
    try {
      const userId = req.session.User_id;
      const { address } = req.body;

      // const carts = await Cart.find({ user: userId }).populate('product');
      const amount = req.body.updatedPrice;
      const lastOrder = await Order.find().sort({ _id: -1 }).limit(1);
      let orderId = 'EMRT000001';
      if (lastOrder.length > 0) {
        const lastOrderId = lastOrder[0].order_id;
        const orderIdNumber = parseInt(lastOrderId.slice(4));
        orderId = `EMRT${`000000${orderIdNumber + 1}`.slice(-6)}`;
      }
      const razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      const options = await razorpayInstance.orders.create({
        amount: amount * 100,
        currency: 'INR',
        receipt: orderId,
      });
      const userDetails = await User.findOne({ _id: userId });

      res.status(201).json({
        success: true,
        options,
        amount,
        userDetails,
        address,
      });
    } catch (err) {
      console.error(`Error Online Payment:`, err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

};

const viewOrders = async (req, res) => {
  const userId = req.session.User_id;
  const user = await User.findOne({ _id: userId });
  const cart = await Cart.find({ user: userId }).populate("product");
  const categories = await Category.find({});
  const wishlist = await wishlistModel.findOne({ userId: userId }).populate("items");
  const orders = await Order.find({ user: userId })
    .populate({
      path: "product.product_id",
      model: "product",
    })
    .sort({ order_id: -1 });

    // const products=orders.product[0].product_id.image[0].url
   
  res.render("User/orderHistory", { categories, orders, user,cart,wishlist });
};

const orderDetails = async (req, res) => {
  const userId = req.session.User_id;

  const user = await User.findOne({ _id: userId });
  let address = user.address;

 

  const order_id = req.query.order_id;
  const exactAddress = req.query.address;
  
  const wishlist = await wishlistModel.findOne({ userId: userId }).populate("items");
  const cart = await Cart.find({ user: userId }).populate("product");
  const order = await Order.findOne({ order_id: order_id }).populate({
    path: "product.product_id",
    model: "product",
  }).populate({
    path: "user",
    model: "user",
  });

  if (order) {
    res.render("User/orderdetails", {
      user,
      order,
      exactAddress,
      address,
      order_id,
      cart,
      wishlist
    });
  } else {
    res.redirect("/orders");
  }
};

const cancelOrder = async (req, res) => {
  const _id = req.params.orderId;
  const userId = req.session.User_id;
  const newStatus = await Order.findOne({_id:_id})
  const netTot=newStatus.netTotal;
  const userWallet = await User.findOneAndUpdate({_id:userId},{$inc:{wallet:netTot}})
 await Order.updateOne(
    { _id },
    {
      $set: {
        status: "cancelled",
      },
    }
  );
 
  return res.json({
    msg: "status changed",
  });
};
const returnOrder = async (req, res) => {
  const id = req.params.orderId;
  const order = await Order.findOne({_id:id})
  const total = order.netTotal;
  const user = req.session.User_id
 
  const newStatus=await Order.updateOne(
    { _id:id },
    {
      $set: {
        status: "returnPending",
      },
    }
  );
 
 

  return res.json({
    msg: "status changed",
  });
};

const applyCoupon = async (req, res) => {
  const code = req.query.coupon
  const couponDetails = await Coupon.findOne({code});
  const Discount = couponDetails.discount;
 
   res.json({
    msg: "status changed",
    Discount,
  });
  }

  const verifyOnlinePayment =async (req, res) => {try {
    const { payment } = req.body;
    const orderDetails = req.body.order;
    const {code,productPrice}=req.query

    
    let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
    hmac.update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`);
    hmac = hmac.digest('hex');
    if (hmac === req.body.payment.razorpay_signature) {
      const { userId } = req.body;
      const cartItems = await Cart.find({ user: userId });
      const productArray = cartItems.map((item) => ({
        product_id: item.product,
        quantity: item.quantity,
      }));
      for (const item of productArray) {
        const id = item.product_id;
        const { quantity } = item;
        await Product.findOneAndUpdate(
          { _id: id },
          { $inc: { stock: -quantity } }
        );
      }







    if(code!=""){
     
      const couponId = await Coupon.findOne({code:code});
      
      var newOrder = new Order({
        order_id: orderDetails.receipt,
        user: userId,
        product: productArray,
        address: req.body.address,
        total_amount: productPrice,
        coupon:couponId._id,
        payment_method: 'Online',
        netTotal: orderDetails.amount / 100
      });
   }else{
    var newOrder = new Order({
    order_id: orderDetails.receipt,
    user: userId,
    product: productArray,
    address: req.body.address,

    total_amount: productPrice,
    payment_method: 'Online',
    netTotal: orderDetails.amount / 100
  });}


      
      await newOrder.save();
      await Cart.deleteMany({ user: userId });
      const orderId = orderDetails.receipt;
      res.status(200).send({ orderId });
    }
  } catch (err) {
    console.error(`Error Verify Online Payment:`, err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }}
  
  const viewCoupons = async (req, res) => {
    const userId = req.session.User_id;
    const user =await User.findOne({_id: userId})
    const categories = await Category.find({});
    const wishlist = await wishlistModel.findOne({ userId: userId }).populate("items");
    const carts = await Cart.find({ user: userId }).populate("product");
    const coupons = await Coupon.find({  });
    console.log("hloo " + coupons);
    res.render('User/coupon', { categories, coupons,wishlist ,carts,user});
  };

  // const applyCoupon = async (req, res) => {
  //   try {
  //     const userId = req.user._id;
  //     const { couponName } = req.body;
  //     const carts = await Cart.find({ user: userId }).populate('product');
  //     const couponInfo = await Coupon.findOne({ code: couponName });
  //     const newTotalAmount = totalAmount(carts);
  
  //     if (!couponName) {
  //       return res
  //         .status(400)
  //         .send({ message: 'Add Coupon Name', newTotalAmount });
  //     }
  
  //     if (!couponInfo) {
  //       return res
  //         .status(400)
  //         .send({ message: 'Coupon name not valid', newTotalAmount });
  //     }
  
  //     const currentDate = new Date();
  
  //     if (couponInfo.expiry < currentDate) {
  //       return res
  //         .status(400)
  //         .send({ message: 'Coupon has expired', newTotalAmount });
  //     }
  
  //     if (couponInfo.users.includes(userId)) {
  //       return res.status(400).send({
  //         message: 'You have already used this coupon',
  //         newTotalAmount,
  //       });
  //     }
  
  //     if (parseInt(req.body.orderTotalAmount) < couponInfo.minAmount) {
  //       return res.status(400).send({
  //         message: 'Total is below the minimum required to use this coupon',
  //         newTotalAmount,
  //       });
  //     }
  
  //     const discountPercentage = couponInfo.discount / 100;
  //     let discountAmount = newTotalAmount * discountPercentage;
  
  //     if (discountAmount > couponInfo.maxDiscountAmount) {
  //       discountAmount = couponInfo.maxDiscountAmount;
  //     }
  
  //     const discountTotal = newTotalAmount - discountAmount;
  
  //     // couponInfo.users.push(req.body.userId);
  //     // await couponInfo.save();
  //     res.status(200).send({
  //       message: 'Coupon added',
  //       discountTotal,
  //       newTotalAmount,
  //       discountAmount,
  //     });
  //   } catch (err) {
  //     console.error(`Error Render Cart Page : ${err}`);
  //     res.redirect('/');
  //   }
  // };
  
  // delete the coupon that is applied to a order in checkout page
  const deleteCoupon = async (req, res) => {
    try {
      const userId = req.user._id;
      const carts = await Cart.find({ user: userId }).populate('product');
      const newTotalAmount = totalAmount(carts);
      res.status(200).send({ message: 'Coupon Removed', newTotalAmount });
    } catch (err) {
      console.error(`Error Render Cart Page : ${err}`);
      res.redirect('/');
    }
  };
  

module.exports = {
  addToCart,
  getCart,
  deleteCartItems,
  incrementCartItems,
  decrementCartItems,
  getCheckOut,
  checkQuantity,
  checkout,
  viewOrders,
  orderDetails,
  cancelOrder,
  returnOrder,
  applyCoupon,
  verifyOnlinePayment,
  viewCoupons,
  // viewWishList,
  // addToWishlist,
  // removeFromWishlist

};
