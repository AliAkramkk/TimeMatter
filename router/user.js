const express = require("express");
const routers = express.Router();
const user = require("../controller/user/authcontroller");
const productController = require("../controller/user/productController");
const cartController = require("../controller/user/cartController");
const userSess = require("../middleware/user");
const { catchErrors } = require("../utility/errorHandler");


routers.get("/login", userSess.islogin, user.loadHome);
routers.post("/login", user.verifyLogin);
routers.get("/signup", user.signup);
routers.post("/signup", user.createUser);
routers.get("/logout", user.userLogout);
routers.get("/", user.loadHome);
routers.get("/successemail/:username", user.successEmail);

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
routers.put(
  "/cartDelete/:id",
  userSess.islogin,
  cartController.deleteCartItems
);
routers.put("/productInc", userSess.islogin, cartController.incrementCartItems);
routers.put("/productDec", userSess.islogin, cartController.decrementCartItems);
routers.get("/quantityCheck", userSess.islogin, cartController.checkQuantity);
routers.get("/checkOut", userSess.islogin, cartController.getCheckOut);
routers.get("/forget", user.forget);
routers.post("/forget", user.forgetverif);
routers.get("/changepass/:email", userSess.islogin, user.changePass);
routers.post("/resetPass", user.resetPass);
routers.post(
  "/checkOut",
  userSess.islogin,
  catchErrors(cartController.checkout)
);
// orders
routers.get(
  "/orders",
  userSess.islogin,
  catchErrors(cartController.viewOrders)
); // view all orders placed by user
routers.get("/orderDetails", userSess.islogin, cartController.orderDetails);
routers.put("/cancelOrder/:orderId", cartController.cancelOrder);
routers.put("/returnOrder/:orderId", cartController.returnOrder);
routers.get("/applyCoupon", cartController.applyCoupon);
routers.put("/verifyOnlinePayment", cartController.verifyOnlinePayment);

routers.get('/category',productController.viewCategories)
routers.get('/getProducts',productController.getRadioProducts)
routers.get('/filterCat',productController.filterCat);
routers.get('/allCat',productController.allCategory);
module.exports = routers;
