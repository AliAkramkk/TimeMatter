const express = require("express");
const routers = express.Router();
const user = require("../controller/user/authcontroller");
const productController = require("../controller/user/productController");
const cartController = require("../controller/user/cartController");
const categoryController = require("../controller/user/categoryController")
const userSess = require("../middleware/user");
const { catchErrors } = require("../utility/errorHandler");
const wishlistController = require("../controller/user/wishlistController")
const walletController = require("../controller/user/walletController")


routers.get("/login", userSess.islogin, user.loadHome);
routers.post("/login", user.verifyLogin);
routers.get("/signup", user.signup);
routers.post("/signup", user.createUser);
routers.get("/logout", user.userLogout);
routers.get("/", user.loadHome);
routers.get("/successemail/:username", user.successEmail);
routers.get("/about", user.aboutPage);
routers.get("/contact", user.contactPage);


routers.get("/shop",  productController.loadShop);
routers.get("/shopDetails",  productController.productDetails);
routers.get("/productDetails", productController.productDetails);
routers.get("/addToCart", userSess.islogin, cartController.addToCart);
routers.get("/profile", userSess.islogin, user.getUserProfile);
routers.get("/edit-Profile", userSess.islogin, user.profileEdit);
routers.post("/edit-profile", user.updatedProfile);
routers.get("/add-address", userSess.islogin, user.getAddAddress);
routers.post("/add-address", userSess.islogin, user.addAddress);
routers.get("/edit-address/:id", userSess.islogin, user.getEditAddress);
routers.post("/edit-address", userSess.islogin,user.editAddress);
routers.get("/delete-address/:id", userSess.islogin, user.deleteAddress);
routers.get("/cart", userSess.islogin, cartController.getCart);
routers.put( "/cartDelete/:id", userSess.islogin, cartController.deleteCartItems);
routers.put("/productInc", userSess.islogin, cartController.incrementCartItems);
routers.put("/productDec", userSess.islogin, cartController.decrementCartItems);
routers.get("/quantityCheck", userSess.islogin, cartController.checkQuantity);
routers.get("/checkOut", userSess.islogin,userSess.isAccess ,cartController.getCheckOut);
routers.get("/forget", user.forget);
routers.post("/forget", user.forgetverif);
routers.get("/changepass/:email", user.changePass);
routers.post("/resetPass", user.resetPass);
routers.post("/checkOut",userSess.islogin,catchErrors(cartController.checkout));
// orders
routers.get(
  "/orders",
  userSess.islogin,
  catchErrors(cartController.viewOrders)
); // view all orders placed by user
routers.get("/orderDetails", userSess.islogin, cartController.orderDetails);
routers.put("/cancelOrder/:orderId", cartController.cancelOrder);
routers.put("/cancelProduct/:orderId/:productId", cartController.cancelProduct);
routers.put("/returnOrder/:orderId", cartController.returnOrder);
routers.get("/applyCoupon", cartController.applyCoupon);
routers.put("/verifyOnlinePayment", cartController.verifyOnlinePayment);

routers.get('/categories', categoryController.viewCategories); // display category page

// filter products by radio button


routers.get('/category',productController.viewCategories)
routers.get('/getProducts',productController.getRadioProducts)
routers.get('/filterCat',productController.filterCat);


routers.get('/addToWishlist',userSess.islogin,userSess.isAccess , wishlistController.addToWishlist);
routers.get('/wishlist', userSess.islogin,userSess.isAccess ,wishlistController.loadWishlist);
routers.get('/removeFromWishlist', userSess.islogin,userSess.isAccess , wishlistController.removeFromWishlist);
// coupon
// routers.post('/applyCoupon', catchErrors(userController.applyCoupon)); // apply coupon at checkout
// routers.delete('/deleteCoupon', catchErrors(userController.deleteCoupon)); // delete coupon which is added at checkout
routers.get( '/coupons',userSess.islogin,userSess.isAccess,cartController.viewCoupons); // list all coupons available to user

routers.get('/wallet',userSess.islogin, walletController.viewWalletPage);
routers.post('/wallet',  walletController.addDataWallet);
routers.put('/verifyWalletPayment',  walletController.verifyWalletPayment);
routers.get("/errorPage",user.errorMessage);
module.exports = routers;
