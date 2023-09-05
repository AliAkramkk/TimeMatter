const productModel = require("../../model/productSchema");
const categoryModel = require("../../model/categorySchema");
const multiple = require("../../utility/uploadImage");
const Order = require("../../model/orderSchema");
const User = require('../../model/userSchema');
// const imageUpload = require('../../utility/uploadImage');
const {multipleImage , imageUpload} = require("../../utility/uploadImage")
const deleteImage = require("../../utility/deleteImage")
const moment = require('moment')

const loadProducts = async (req, res) => {
  try{
  const categories = await categoryModel.find();
  const PageSize = 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * PageSize;
  const products = await productModel.find().skip(skip).limit(PageSize);
  const productCount = await productModel.countDocuments();
        
       
        const count = Math.ceil(productCount / PageSize);
  res.render("Admin/product", { products, categories ,page,count});
  }catch(error){
    res.redirect('/errorPage')
  }
};

const loadAddProducts = async (req, res) => {
  const categories = await categoryModel.find();
  res.render("Admin/addProduct", { categories: categories });
};

const addProduct = async (req, res) => {
  try {
    const productName = req.body.productName;
    const category = req.body.category;
    let price = req.body.price;
    let quantity = req.body.quantity;
    const blurb = req.body.blurb;
    const description = req.body.description;

    const images = req.files.image;

    price = parseFloat(price);
    quantity = parseInt(quantity);

    const urlList = await multiple.multipleImage(images);

    const newProduct = productModel({
      productName: productName,
      category: category,
      price: price,
      quantity: quantity,
      blurb: blurb,
      description: description,
      image: urlList,
    });

    await newProduct.save();
    res.redirect("/admin/product");
  } catch (err) {
    res.redirect('/errorPage');
  }
};

const loadEditProduct = async (req, res) => {
  try{
  const id = req.query.id;
  const categories = await categoryModel.find();
  const product = await productModel.findOne({ _id: id });
  res.render("admin/editProduct", { categories, product });
  }catch{
    res.redirect('/errorPage')
  }
};

const editProduct = async (req, res) => {
  try {
    const productName = req.body.productName;
    const id = req.query.id;
    const category = req.body.category;
    let price = req.body.price;
    let quantity = req.body.quantity;
    const blurb = req.body.blurb;
    const description = req.body.description;

    price = parseFloat(price);
    quantity = parseInt(quantity);

    await productModel.findByIdAndUpdate(id, {
      productName: productName,
      category: category,
      price: price,
      quantity: quantity,
      blurb: blurb,
      description: description,
    });

    res.redirect("/admin/product");
  } catch (error) {
    res.redirect('/errorPage');
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id, active } = req.query;

    if (active == "true") {
      await productModel.findByIdAndUpdate(id, { $set: { isActive: false } });
    } else if (active == "false") {
      await productModel.findByIdAndUpdate(id, { $set: { isActive: true } });
    }

    res.redirect("/admin/product");
  } catch (error) {
    res.redirect('/errorPage');
  }
};
const viewOrder = async (req, res) => {
  try {
    const order = await Order.find()
    
      .populate({
        path: "product.product_id",
        model: "product",
      })
      .populate({
        path: "user",
        model: "user",
      }).sort({ order_id: -1 }) ;
      console.log(order);

    res.render("Admin/orders", { order }); // Pass the sorted orders to the view
  } catch (error) {
    res.redirect('/errorPage');
    
  }
};

const orderDetails = async (req, res) => {
  try{
  const id=req.params.id
  const orderDetails= await  Order.findById(id).populate({
    path: "product.product_id",
    model: "product",
  }).populate({
    path: "user",
    model: "user",
  })
  
  res.render('Admin/orderSummary',{orderDetails})
       
} catch (error) {
  res.redirect('/errorPage');
}
};


const editOrder = async (req, res) => {
  try{
  const { id } = req.params;
  const order= await  Order.findById(id).populate({
    path: "product.product_id",
    model: "product",
  }).populate({
    path: "user",
    model: "user",
  });
  res.render('admin/orderDetails', { order });
       
} catch (error) {
  res.redirect('/errorPage');
}
};

const postEditOrder =async(req,res)=>{
  try{
   const _id=req.params.id

   const order=await Order.findOne({_id:_id})
 
 
   const paymentM=order.payment_method   
 
   const user = order.user

   const total = order.netTotal
  
   const status=req.body.status

   const orderStatus=await Order.findOneAndUpdate({_id:_id},{$set:{status:status}})
   if((status=="cancelled"||"returned")&&paymentM=="Online"){
    const walletUpdate = await User.findOneAndUpdate({_id:user},{$inc:{wallet:total}})
   }
   req.flash('success', 'Order Updated Succesfully');
   res.redirect("/admin/orders");
        
} catch (error) {
  res.redirect('/errorPage');
}
};

const loadImages = async (req, res)=>{

  try {

      const { id } = req.query;
      const product = await productModel.findOne({_id: id});

      res.render('Admin/editImages',{product});
      
  } catch (error) {
    res.redirect('/errorPage');
  }
  
}



const deleteProductImage = async (req, res)=>{
  try{
  const { public_id, productId } = req.query;

  await deleteImage(public_id);
 

  await productModel.updateOne({_id: productId, "image.public_id": public_id},
      {
          $pull: {
              "image": {public_id: public_id}
          }
      }
  )



  
  res.json({response: true})
       
} catch (error) {
  res.redirect('/errorPage');
}
}

const loadAddImage = async (req, res)=>{
  try {

      const {productId} = req.query;
      const product = await productModel.findOne({_id: productId});
      res.render('Admin/addImage',{productId,product})

  } catch (error) {
    res.redirect('/errorPage');
  }
}


const editImage = async (req, res) => {
  try {
    const { image } = req.files;
    const { productId } = req.query;

    // const result = await imageUpload(image);

    // Use the multipleImage function to handle multiple images
    const images = await multipleImage(image);

    await productModel.updateOne(
      { _id: productId },
      {
        $push: {
          image: { $each: images }, // Use $each to push multiple images
        },
      }
    );

    res.redirect('/admin/product');
  } catch (error) {
    res.redirect('/errorPage');
  }
};

const getSalesReport = async (req, res) => {
  try{
  let startDate = new Date(new Date().setDate(new Date().getDate() - 8));
  let endDate = new Date();
  if (req.query.startDate) {
    startDate = new Date(req.query.startDate);
    startDate.setHours(0, 0, 0, 0);
  }
  if (req.query.endDate) {
    endDate = new Date(req.query.endDate);
    endDate.setHours(24, 0, 0, 0);
  }
  if (req.query.filter === 'thisYear') {
    const currentDate = new Date();
    startDate = new Date(currentDate.getFullYear(), 0, 1);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(new Date().setDate(new Date().getDate() + 1));
    endDate.setHours(0, 0, 0, 0);
  }
  if (req.query.filter === 'lastYear') {
    const currentDate = new Date();
    startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(currentDate.getFullYear() - 1, 11, 31);
    endDate.setHours(0, 0, 0, 0);
  }
  if (req.query.filter === 'thisMonth') {
    const currentDate = new Date();
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    endDate.setHours(0, 0, 0, 0);
  }
  if (req.query.filter === 'lastMonth') {
    const currentDate = new Date();
    startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    endDate.setHours(0, 0, 0, 0);
  }

  const orders = await Order.find({
    orderTime: { $gt: startDate, $lt: endDate },
  })
    .populate({
      path: 'product.product_id',
      model: 'product',
      select: '-description -blurb',
    })
    .select('-address')
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
        _id: null,
        count: { $sum: 1 },
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
  // const ordersDispatched = await Order.aggregate([
  //   {
  //     $match: {
  //       status: 'outForDelivery',
  //       orderTime: {
  //         $gt: startDate,
  //         $lt: endDate,
  //       },
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: null,
  //       count: { $sum: 1 },
  //       sum: { $sum: '$total_amount' },
  //     },
  //   },
  // ]);
  const byCategory = await Order.aggregate([
    { $match: { orderTime: { $gt: startDate, $lt: endDate } } },
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
  console.log(byCategory);
  let filter = req.query.filter ?? '';
  if (!req.query.filter && !req.query.startDate) {
    filter = 'lastWeek';
  }

  res.render('admin/salesReport', {
    orders,
    startDate: moment(
      new Date(startDate).setDate(new Date(startDate).getDate() + 1)
    )
      .utc()
      .format('YYYY-MM-DD'),
    endDate: moment(endDate).utc().format('YYYY-MM-DD'),
    totalRevenue,
    totalPending,
    // ordersDispatched,
    byCategory,
    filter,
    orderCount,
  });
       
} catch (error) {
  res.redirect('/errorPage');
}
};





module.exports = {
  loadProducts,
  loadAddProducts,
  addProduct,
  loadEditProduct,
  editProduct,
  deleteProduct,
  viewOrder,
  orderDetails,
  editOrder,
  postEditOrder,
  loadImages,
  deleteProductImage,
  loadAddImage,
  editImage,
  getSalesReport 
};
