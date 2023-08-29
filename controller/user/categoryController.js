const Category =require("../../model/categorySchema");


const Product = require("../../model/productSchema");
const userModel = require("../../model/userSchema");
const Cart = require("../../model/cartSchema");
const wishlistModel = require("../../model/wishList")


const viewCategories = async (req, res) => {
try {
  

  const id = req.session.User_id;
  const user = await userModel.findOne({ _id: id });
  const categories = await Category.find({});
  const cart = await Cart.find({ user: id }).populate("product");
  const wishlist = await wishlistModel.findOne({ userId: id }).populate("items");
  const filter = req.query.filter ?? '';
  const limit = 6;
  const key = req.query.key ?? '';
  const page = req.query.page ?? 0;
  const { category } = req.query ?? '';

  if (filter == 0) {
    const products = await Product.find({
      productName: new RegExp(key, 'i'),
      category_id: new RegExp(category, 'i'),
    })
      .skip(page * limit)
      .limit(limit);

    const productCount = await Product.find({
      product_name: new RegExp(key, 'i'),
      category_id: new RegExp(category, 'i'),
      status: true,
    }).count();
    const pageCount = Math.ceil(productCount / limit);
    return res.render('User/cat', {
      categories,
      products,
      category,
      filter,
      key,
      pageCount,
      page,
      wishlist,
      cart,
      user
    });
 
  }
  if (filter && !key) {
    const products = await Product.find({
      category_id: new RegExp(category, 'i'),
    })
      .sort({ price: filter })
      .skip(page * limit)
      .limit(limit);
    const productCount = await Product.find(
      {
        category_id: new RegExp(category, 'i'),
      },
      { status: true }
    ).count();
    const pageCount = Math.ceil(productCount / limit);
    console.log(pageCount);
    res.render('User/cat', {
      categories,
      products,
      category,
      filter,
      key,
      pageCount,
      page,
      wishlist,
      cart,
      user
    });
  }
  if (filter && key) {
    const products = await Product.find({
      category_id: new RegExp(category, 'i'),
      product_name: new RegExp(key, 'i'),
    })
      .sort({ price: filter })
      .skip(page * limit)
      .limit(limit);

    const productCount = await Product.find(
      {
        category_id: new RegExp(category, 'i'),
      },
      { status: true }
    ).count();
    const pageCount = Math.ceil(productCount / limit);
    res.render('User/cat', {
      categories,
      products,
      category,
      filter,
      key,
      pageCount,
      page,
      wishlist,
      cart,
      user
    });
  }
} catch (error) {
  console.log(error);
  }
};

// change products in category page based on the radio buttons
const getRadioProducts = async (req, res) => {
  const { category } = req.query ?? '';
  const filter = req.query.filter ?? '';
  const key = req.query.key ?? '';
  const page = req.query.page ?? 0;
  const limit = 6;
  if (filter == 0) {
    const products = await Product.find({
      product_name: new RegExp(key, 'i'),
      category_id: new RegExp(category, 'i'),
    })
      .skip(page * limit)
      .limit(limit)
      .lean();
    const productCount = await Product.find({
      product_name: new RegExp(key, 'i'),
      category_id: new RegExp(category, 'i'),
      status: true,
    }).count();
    const pageCount = Math.ceil(productCount / limit);
    return res.send({
      data: 'this is data',
      products,
      filter,
      page,
      pageCount,
    });
  }
  if (filter) {
    const products = await Product.find({
      product_name: new RegExp(key, 'i'),
      category_id: new RegExp(category, 'i'),
    })
      .sort({ price: filter })
      .skip(page * limit)
      .limit(limit)
      .lean();
    const productCount = await Product.find({
      product_name: new RegExp(key, 'i'),
      category_id: new RegExp(category, 'i'),
      status: true,
    }).count();
    const pageCount = Math.ceil(productCount / limit);

    return res.send({
      data: 'this is data',
      products,
      filter,
      page,
      pageCount,
    });
  }
};

module.exports={
  viewCategories,
  getRadioProducts

}