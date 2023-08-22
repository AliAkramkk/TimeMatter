const Category = require("../../model/categorySchema");
const productModel = require("../../model/productSchema");
const userModel = require("../../model/userSchema");
const Cart = require("../../model/cartSchema");
const wishlistModel = require("../../model/wishList")


const loadShop = async (req, res) => {
  const id = req.session.User_id;
  const user = await userModel.findOne({ _id: id });
 
  const products = await productModel.find();
  const categories = await Category.find();
  const cart = await Cart.find({ user: id }).populate("product");
  const wishlist = await wishlistModel.findOne({ userId: id }).populate("items");
  res.render("User/shop", { categories, products, user, id ,cart,wishlist});
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
    const categories = await Category.find();
    const cart = await Cart.find({ user: id}).populate("product");
    const wishlists = await wishlistModel.findOne({ userId: id });
    const wishlist = await wishlistModel.findOne({ userId: id }).populate("items");
    let wish = false;
    if (user && wishlist && wishlist.items.length > 0) {
        if (wishlist.items.includes(product._id)) {
            wish = true;
        }
    }
    res.render("User/productDetails", {
      categories,
      product,
      products,
      relatedProducts,
      user,
      id,
      cart,
      wish,
      wishlist
      
    });
  } catch (error) {
    console.log(error);
  }
};

const loadWishlist = async (req, res) => {
  try{
    const id = req.session.User_id;
    const cart = await cartModel.findOne({ userId: id })
    const wishlist = await wishlistModel.findOne({ userId: id }).populate("items");
    const user = await userModel.findOne({ _id: id })
    const products = await productModel.find({
        _id: { $in: user.wishlist },
    }).lean()
    res.render('User/wishlist', { user, products, cart,wishlist });
  }catch (error) {
    res.render('User/404page')
  }
}


const addToWishlist = async (req, res) => {
  try {
    const id = req.session.User_id;
    const productid = req.query.productId;
    await userModel.updateOne({ _id: id }, { $push: { wishlist: productid } });
    res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Failed to add to wishlist" });
    }
}

const viewCategories = async (req, res) => {
  const id = req.session.User_id;
  const cart = await Cart.find({ user: id }).populate("product");
  const user = await userModel.findOne({ _id: id });
  const categories = await Category.find({});
  const wishlist = await wishlistModel.findOne({ userId: id }).populate("items");
  const filter = req.query.filter ?? '';
  const limit = 6;
  const key = req.query.key ?? '';
  const page = req.query.page ?? 0;
  const { category } = req.query ?? '';
  if (!category) {
    const products = await productModel.find({
      productName: new RegExp(key, 'i'),
    })
      .sort({ price: filter })
      .skip(page * limit)
      .limit(limit);
    const productCount = await productModel.find({
      productName: new RegExp(key, 'i'),
      status: true,
    }).count();
    const pageCount = Math.ceil(productCount / limit);
   
    return res.render('User/categories', {
      categories,
      products,
      category,
      filter,
      key,
      pageCount,
      page,
      user,
      cart,
      wishlist
    });
}
if (category) {
  const products = await productModel.find({ category_id: category })
    .sort({ price: filter })
    .skip(page * limit)
    .limit(limit);
  const productCount = await productModel.find(
    {
      category_id: category,
    },
    { status: true }
  ).count();
  const pageCount = Math.ceil(productCount / limit);
  const cart = await Cart.find({ user: id }).populate("product");
  res.render('categories', {
    categories,
    products,
    category,
    filter,
    key,
    pageCount,
    page,
    cart
  });
}
}
const filterCat = async (req, res) => {
  const catId = req.query.category;
  
  // Check if a specific category is selected
  if (catId) {
    const products = await productModel.find({ category: catId });
    if (products.length !== 0) {
      return res.send({
        data: 'this is data',
        products,
        length: true,
      });
    } else {
      return res.send({
        data: 'this is data',
        products,
        length: false,
      });
    }
  } 
};

const allCategory= async (req, res) => {
const products= await  productModel.find({});
console.log(products);
return res.send({
  data:'this is data',
  products,
 
})

};

const getRadioProducts = async (req, res) => {
  const { category } = req.query ?? '';
  const filter = req.query.filter ?? '';
  const key = req.query.key ?? '';
  const page = req.query.page ?? 0;
  const limit = 6;
  if (!filter && category) {
    const products = await productModel.find({
      productName: new RegExp(key, 'i'),
      category: category,
    })
      .skip(page * limit)
      .limit(limit)
      .lean();
    const productCount = await productModel.find({
      productName: new RegExp(key, 'i'),
      category: category,
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
  if (category && filter !== 0) {
    const products = await productModel.find({
      productName: new RegExp(key, 'i'),
      category_id: category,
    })
      .sort({ price: filter })
      .skip(page * limit)
      .limit(limit)
      .lean();
    const productCount = await productModel.find({
      productName: new RegExp(key, 'i'),
      category_id: category,
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
  if (!category && filter !== '0') {
    const products = await productModel.find({ product_name: new RegExp(key, 'i') })
      .sort({ price: filter })
      .skip(page * limit)
      .limit(limit)
      .lean();
    const productCount = await productModel.find({
      productName: new RegExp(key, 'i'),
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
  if (!category && !filter) {
    const products = await productModel.find({
      productName: new RegExp(key, 'i'),
    })
      .sort({ price: filter })
      .skip(page * limit)
      .limit(limit)
      .lean();
    const productCount = await productModel.find({
      productName: new RegExp(key, 'i'),
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


module.exports = {
  loadShop,
  productDetails,
  viewCategories,
  getRadioProducts,
  filterCat,
  allCategory,
  addToWishlist,
  loadWishlist,
};
