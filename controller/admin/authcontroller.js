const User = require("../../model/userSchema");
const bcrypt = require("bcrypt");
const Order =require('../../model/orderSchema')
const Category = require('../../model/categorySchema')
// login

const adminLogin = async (req, res) => {
  res.render("Admin/adminLogin", { message: "" });
};

const verifyAdminLogin = async (req, res) => {
  const userName = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const userData = await User.findOne({ email: email });
  if (userData) {
    const passMatch = await bcrypt.compare(password, userData.password);
    if (passMatch) {
      if (userData.isAdmin) {
        req.session.Admin = userData.email;
        res.redirect("/admin/");
      } else {
        res.render("Admin/adminLogin", { message: "Access Denied" });
      }
    } else {
      res.render("Admin/adminLogin", { message: "Invalid password" });
    }
  } else {
    res.render("Admin/adminLogin", { message: "Invalid User" });
  }
};

const adminLogout = async (req, res) => {
  try {
    req.session.Admin = null;
    res.redirect("/admin/login"); // Redirect to the admin login page
  } catch (error) {
    console.log(error.message);
  }
};

const blockUser = async (req, res) => {
  const userData = await User.findOne({ email: email });
  try {
    userData.isAccess = false;
    res.redirect("/userData");
  } catch (error) {
    console.log(error.message);
  }
};
const dashBoard = async (req, res) =>{
  const orders = await Order.find({});
  const monthlyDataArray = await Order.aggregate([
    { $match: { status: 'delivered' } },
    {
      $group: { _id: { $month: '$orderTime' }, sum: { $sum: '$total_amount' } },
    },
  ]);
  const totalRevenue = await Order.aggregate([
    {
      $group: { _id: null, total: { $sum: '$total_amount' } },
    },
  ]);
  const orderCount = await Order.find({}).count();
  const ordersCompleted = await Order.find({ status: 'delivered' }).count();
  const pendingOrders = await Order.find({ status: 'pending' }).count();
  const ordersOnTheWay = await Order.find({ status: 'outForDelivery' }).count();
  const monthlyDataObject = {};
  monthlyDataArray.map((item) => (monthlyDataObject[item._id] = item.sum));
  const monthlyData = [];
  for (let i = 1; i <= 12; i++) {
    monthlyData[i - 1] = monthlyDataObject[i] ?? 0;
  }
  const payment = await Order.aggregate([
    { $group: { _id: '$payment_method', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const paymentData = [];
  payment.forEach((item) => {
    paymentData.push(parseFloat(item.count));
  });
  const categoryPrice = await Order.aggregate([
    {
      $unwind: {
        path: '$product',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product.product_id',
        foreignField: '_id',
        as: 'product.products',
      },
    },
    { $unwind: '$product.products' },
    {
      $group: {
        _id: '$product.products.category_name',
        price: { $sum: '$product.products.price' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  const category = await Category.aggregate([
    { $group: { _id: '$category_name' } },
    { $sort: { _id: 1 } },
  ]);
  const categoryName = [];
  const totalPrice = [];
  categoryPrice.forEach((item) => {
    totalPrice.push(item.price);
  });
  category.forEach((item) => {
    categoryName.push(item._id);
  });
  res.render('Admin/dashBoard',{
    orderCount,
    ordersCompleted,
    pendingOrders,
    ordersOnTheWay,
    monthlyData,
    totalRevenue,
    paymentData,
    categoryName,
    totalPrice,
  });
};


 



const getSalesReport = async (req, res) =>{
  let startDate = new Date(new Date().setDate(new Date().getDate() - 8));
 
  let endDate = new Date();
 
  const orders = await Order.find({
    orderTime: { $gt: startDate, $lt: endDate },
  })
    .populate({
      path: 'product.product_id',
      model: 'product',
    })
    .sort({ order_id: -1, orderTime: -1 })
    .lean();

  const orderCount = await Order.find({
    orderTime: { $gt: startDate, $lt: endDate },
  })
    .populate({
      path: 'product.product_id',
      model: 'product',
    })
    .sort({ order_id: -1, orderTime: -1 })
    .count();
  
  const totalRevenue = await Order.aggregate([
    {
      $match: {
        status: 'delivered',
        orderTime: {
          $gt: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id:null,
        count: {$sum: 1 } ,
        sum: { $sum: '$total_amount' },
      
      },
    },
  ]);
  const totalPending = await Order.aggregate([
    {
      $match: {
        status: 'pending',
        orderTime: {
          $gt: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        sum: { $sum: '$total_amount' },
      },
    },
  ]);
  const byCategory = await Order.aggregate([
    { $match: { orderTime: { $gt: startDate, $lt: endDate },status:'delivered' } },
    {
      $unwind: {
        path: '$product',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product.product_id',
        foreignField: '_id',
        as: 'product.products',
      },
    },
   
    { $unwind: '$product.products' },
 
    {
      $group: {
        _id: '$product.products.category',
        count: { $sum: 1 },
        price: { $sum: '$product.products.price' },
      },
    },
  ]);
  console.log( byCategory);
}
module.exports = {
  adminLogin,
  verifyAdminLogin,
  adminLogout,
  blockUser,
  dashBoard,
  getSalesReport
};
