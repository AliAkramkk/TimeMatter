const express = require("express");
const routers = express.Router();

const adminSess = require("../middleware/admin");
const adminAuth = require("../controller/admin/authcontroller");
const category = require("../controller/admin/categoryController");
const admin = require("../controller/admin/adminController");
const product = require("../controller/admin/productOperations");
const couponController = require("../controller/admin/coponController");

routers.get("/", adminSess.isLogin, adminAuth.dashBoard);
routers.post("/login", adminAuth.verifyAdminLogin);
routers.get("/signOut", adminAuth.adminLogout);
// Add this route for admin login page
routers.get("/login", adminAuth.adminLogin);


routers.get("/blockUser", adminAuth.blockUser);
routers.get("/userData", adminSess.isLogin, admin.userTable);
routers.post("/userData", admin.updateAccess);

routers.get("/category", adminSess.isLogin, category.loadCategory);
routers.get("/addCategory", adminSess.isLogin, category.loadAddCategory);
routers.post("/addCategory", category.addCategory);
routers.get("/category/edit", category.loadEditCategory);
routers.post("/category/edit",adminSess.isLogin, category.editCategory);

routers.get("/product", adminSess.isLogin, product.loadProducts);
routers.get("/product/add", adminSess.isLogin, product.loadAddProducts);
routers.post("/product/add", product.addProduct);
routers.get("/product/edit", adminSess.isLogin,product.loadEditProduct);
routers.post("/product/edit", product.editProduct);
routers.get('/product/image',adminSess.isLogin,product.loadImages);
routers.delete('/product/image/delete',product.deleteProductImage)
routers.get('/product/image/add',adminSess.isLogin,product.loadAddImage);
routers.post('/product/image/add',product.editImage);

routers.get("/product/delete", product.deleteProduct);
routers.get("/orders",adminSess.isLogin, product.viewOrder);
routers.get("/orderSummary/:id",adminSess.isLogin, product.orderDetails);
routers.get("/editOrder/:id",adminSess.isLogin, product.editOrder);
routers.post("/editOrder/:id",adminSess.isLogin, product.postEditOrder);
// routers.get("/orders", adminSess.isLogin, admin.listOrders); // list all orders made by users

routers.get("/addCoupon",adminSess.isLogin, couponController.addCoupon);
routers.post("/addCoupon",adminSess.isLogin, couponController.newCoupon);
routers.get("/coupon",adminSess.isLogin, couponController.viewCoupon);


module.exports = routers;
