const productModel = require("../../model/productSchema");
const categoryModel = require("../../model/categorySchema");
const multiple = require("../../utility/uploadImage");
const Order = require("../../model/orderSchema");
const User = require('../../model/userSchema');
const imageUpload = require('../../utility/uploadImage');
const multipleImage = require('../../utility/uploadImage').multipleImage;

const loadProducts = async (req, res) => {
  const products = await productModel.find();
  const categories = await categoryModel.find();
  console.log(products);
  res.render("Admin/product", { products, categories });
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
    console.log(err);
  }
};

const loadEditProduct = async (req, res) => {
  const id = req.query.id;
  const categories = await categoryModel.find();
  const product = await productModel.findOne({ _id: id });
  res.render("admin/editProduct", { categories, product });
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
    console.log(error.message);
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
    console.log(error.message);
  }
};
const viewOrder = async (req, res) => {
  const order = await Order.find().populate({
    path: "product.product_id",
    model: "product",
  }).populate({
    path: "user",
    model: "user",
  });
  
  res.render("Admin/orders", { order });
};
const orderDetails = async (req, res) => {
  const id=req.params.id
  const orderDetails= await  Order.findById(id).populate({
    path: "product.product_id",
    model: "product",
  }).populate({
    path: "user",
    model: "user",
  })
  
  res.render('Admin/orderSummary',{orderDetails})
}
const editOrder = async (req, res) => {
  const { id } = req.params;
  const order= await  Order.findById(id).populate({
    path: "product.product_id",
    model: "product",
  }).populate({
    path: "user",
    model: "user",
  });
  res.render('admin/orderDetails', { order });
}
const postEditOrder =async(req,res)=>{
   const _id=req.params.id
  //  console.log("_id "+_id);
   const order=await Order.findOne({_id:_id})
  //  console.log("_id "+_id);
 
   const paymentM=order.payment_method   
  //  console.log("_PM "+paymentM);
   const user = order.user
  //  console.log("User "+user);
   const total = order.netTotal
  //  console.log("total "+total);
   const status=req.body.status
  //  console.log("status "+status);
   const orderStatus=await Order.findOneAndUpdate({_id:_id},{$set:{status:status}})
   if((status=="cancelled"||"returned")&&paymentM=="Online"){
    const walletUpdate = await User.findOneAndUpdate({_id:user},{$inc:{wallet:total}})
   }
 
   res.redirect("/admin/orders");
}

const loadImages = async (req, res)=>{

  try {

      const { id } = req.query;
      const product = await productModel.findOne({_id: id});

      res.render('Admin/editImages',{product});
      
  } catch (error) {
      console.log(error);
  }
  
}



const deleteProductImage = async (req, res)=>{
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
}

const loadAddImage = (req, res)=>{
  try {

      const {productId} = req.query;
      
      res.render('Admin/addImage',{productId})

  } catch (error) {
      console.log(error);
  }
}

const editImage = async (req, res)=>{
  try {

      const { image } = req.files;
      const { productId } = req.query;

      const result = await imageUpload(image);

      await productModel.updateOne({_id: productId},
          {
              $push: {
                  image: result 
              }
          })
      
      res.redirect('/admin/product')
      
  } catch (error) {
      console.log(error);
  }
}


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
  editImage
};
