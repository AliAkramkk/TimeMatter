const categoryModel = require("../../model/categorySchema");
const productModel = require("../../model/productSchema");
const userModel = require("../../model/userSchema");

const loadShop = async (req, res) => {
  const id = req.session.User_id;
  const user = await userModel.findOne({ _id: id });

  const products = await productModel.find();
  const categories = await categoryModel.find();
  res.render("User/shop", { categories, products, user, id });
};

// const productDetails = async (req, res) => {
//     const userId = req.session.User_id;
//     const user = await userModel.findOne({ _id: userId });
//     const productId = req.query.id;
//     const products = await productModel.find();
//     const relatedProducts = await productModel.find()
//     const product = await productModel.findOne({ _id: productId });
//     const categories = await categoryModel.find();

//     res.render('User/productDetails', { categories, product,products, relatedProducts, user,userId });
// };
const productDetails = async (req, res) => {
  try {
    const id = req.session.User_id;
    const user = await userModel.findOne({ _id: id });
    const productId = req.query.id; // Get the product ID from the request body
    // console.log(req.query);

    const products = await productModel.find().limit(4);
    const relatedProducts = await productModel.find().limit(8);
    const product = await productModel.findOne({ _id: productId });
    const categories = await categoryModel.find();
    res.render("User/productDetails", {
      categories,
      product,
      products,
      relatedProducts,
      user,
      id,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadShop,
  productDetails,
};
