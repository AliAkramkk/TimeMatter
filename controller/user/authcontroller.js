const User = require("../../model/userSchema");
const bcrypt = require("bcrypt");
const mail = require("../../utility/sendEmail");
const Product = require("../../model/productSchema");
const Category = require("../../model/categorySchema");
const createdId = require("../../actions/createdId");
const Cart = require("../../model/cartSchema");
const wishlistModel = require("../../model/wishList");
const { body, validationResult } = require('express-validator');
const validationHelpers = require('../../helper')
const { sendOTP } = require('../../utility/sendEmail')

const { log } = require("console");



const signup = async (req, res) => {
  res.render("User/usersignup", { message: "" });
};

const hashPassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    res.redirect('/errorPage')
  }
};

// Function to create new user
const createUser = async (req, res) => {
  try {
    const userName = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      res.render("User/usersignup", {
        message: "User already Exists",
      });
    } else {
      const sPass = await hashPassword(password);

      const newUser = new User({
        username: userName,
        email: email,
        password: sPass,
      });
      const savedUser = await newUser.save();
      const verify = await mail.verifyEmail(newUser);
      res.render("User/verifyEmail");
    }
  } catch (error) {
    res.redirect('/errorPage')
  }
};

// Existing user Login

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passMatch = await bcrypt.compare(password, userData.password);
      if (passMatch) {
        if (userData.isVerified) {
          if (userData.isAccess) {
            if (userData.isAdmin) {
              req.session.Admin = userData._id;
            }
            req.session.User_id = userData._id;
            return res.redirect("/"); // Redirect to home page
          } else {
            return res.render("User/userlogin", { message: "Access Denied" });
          }
        } else {
          const verify = await mail.verifyEmail(userData);
          return res.render("User/userlogin", { message: "Invalid User" });
        }
      } else {
        return res.render("User/userlogin", { message: "Invalid User" });
      }
    } else {
      return res.render("User/userlogin", { message: "Invalid User" });
    }
  } catch {
    res.redirect('/errorPage')
  }

};

// Home if session, else Login
const loadHome = async (req, res) => {
  try {


    const id = req.session.User_id;

    const user = await User.findOne({ _id: id });
    const categories = await Category.find();
    const wishlist = await wishlistModel.findOne({ userId: id }).populate("items");
    const products = await Product.find({ isActive: true });
    const cart = await Cart.find({ user: id }).populate("product");
    res.render("User/home", {
      categories,
      products,
      user,
      id,
      cart,
      wishlist,
      message: req.query.message,
    });
  } catch (error) {
    res.redirect('/errorPage')
  }
};

// User Logout
const userLogout = async (req, res) => {
  try {
    req.session.User_id = null;
    res.clearCookie("User_id");
    res.redirect("/");
  } catch (error) {
    res.redirect('/errorPage')
  }
};

const successEmail = async (req, res) => {
  try {
    const username = req.params.username;
    const token = req.params.emailToken
    const user = await User.findOne({
      emailToken: token,
    });
    if (user) {
      user.emailToken = undefined;
      await user.save();
      res.render("User/successEmail", { message: req.params.username });
      await User.findOneAndUpdate(
        { username: username },
        { $set: { isVerified: true } }
      );
    } else {
      res.redirect('/errorPage')
    }
  } catch {
    res.redirect('/errorPage')
  }
  // const otpVerify = async (req, res) => {
  //   const enteredOTP =
  //     req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
  //   const user = await User.findOne({
  //     otpToken: enteredOTP,
  //     tokenExpires: { $gt: Date.now() },
  //   });
  //   if (user) {
  //     req.session.isOTPVerified = true;
  //     user.otpToken = undefined;
  //     user.tokenExpires = undefined;
  //     await user.save();
  //     res.redirect('/');
  //   } else {
  //     req.flash('error', 'Entered otp is incorrect/expired');
  //     res.redirect('/otp');
  //   }
  // };
};

// Function to get user profile data
const getUserProfile = async (req, res) => {
  try {
    const userId = req.session.User_id;
    const user = await User.findOne({ _id: userId });
    const wishlist = await wishlistModel.findOne({ userId: userId }).populate("items");
    if (!user) {
      return res.render("User/userlogin", { message: "Invalid User" });
    }
    const cart = await Cart.find({ user: userId }).populate("product");
    res.render("User/userProfile", { user, message: req.query.message, cart, wishlist });
  } catch (error) {
    res.redirect('/errorPage')
  }
};

const profileEdit = async (req, res) => {
  try {
    const userId = req.session.User_id;
    const user = await User.findOne({ _id: userId });
    const cart = await Cart.find({ user: userId }).populate("product");
    const wishlist = await wishlistModel.findOne({ userId: userId }).populate("items");
    if (!user) {
      return res.render("User/userlogin");
    }

    res.render("User/editProfile", { cart, wishlist, user });
  } catch (error) {
    console.log(error.message);
  }
};
const updatedProfile = async (req, res) => {
  const { username, email, password, newPassword } = req.body;
  if (username == "" || email == "" || newPassword == "") {
    return res.redirect("/edit-Profile")
  }
  const user = await User.findOne({ email });
  if (bcrypt.compareSync(password, user.password)) {
    await User.updateOne(
      { email },
      {
        $set: { email, username },
      }
    );
    return res.redirect("/profile");
  }
  return res.redirect("/edit-Profile");
};
const getAddAddress = async (req, res) => {
  const couponId = req.query.couponId ?? null;
  const userId = req.session.User_id;
  const wishlist = await wishlistModel.findOne({ userId: userId }).populate("items");
  const cart = await Cart.find({ user: userId }).populate("product");
  const redirect = req.query.redirect;
  res.render("User/addAddress", { redirect, wishlist, cart, couponId });
};

const addAddress = async (req, res) => {
  const couponId = req.query.couponId ?? null;
  console.log(couponId);
  const { username, mobile, pincode, locality, address, city, state } =
    req.body;
  await User.updateOne(
    { _id: req.session.User_id },
    {
      $addToSet: {
        address: {
          username,
          mobile,
          pincode,
          locality,
          address,
          city,
          state,

          id: createdId(),
        },
      },
    }
  );
  const redirect = req.query.redirect;
  res.redirect("/" + redirect + '?' + "couponId=" + couponId);
};

const getEditAddress = async (req, res) => {
  const couponId = req.query.couponId ?? null;
  console.log(couponId);
  const userId = req.session.User_id
  const redirect = req.query.redirect;
  const discountP = req.query.updatedPrice
  const cart = await Cart.find({ user: userId }).populate("product");
  const wishlist = await wishlistModel.findOne({ userId: userId }).populate("items");
  let { address } = await User.findOne(
    { "address.id": req.params.id },
    { _id: 0, address: { $elemMatch: { id: req.params.id } } }
  );
  res.render("User/editAddress", { key: "", address: address[0], redirect, cart, wishlist, discountP, couponId });

};

const editAddress = async (req, res) => {
  await User.updateOne(
    { _id: req.session.User_id, address: { $elemMatch: { id: req.body.id } } },
    {
      $set: {
        "address.$": req.body,
      },
    }
  );
  const redirect = req.query.redirect;
  const couponId = req.query.couponId
  console.log(redirect);
  res.redirect("/" + redirect + '?' + "couponId=" + couponId);

};

const deleteAddress = async (req, res) => {
  try {
    await User.updateOne(
      {
        _id: req.session.User_id,
        address: { $elemMatch: { id: req.params.id } },
      },
      {
        $pull: {
          address: {
            id: req.params.id,
          },
        },
      }
    );
    const redirect = req.query.redirect;
    console.log(redirect);
    res.redirect("/" + redirect);
  } catch (error) {
    res.redirect('/errorPage');
  }
};

const forget = async (req, res) => {
  const id = 'reset';
  res.render("User/forgotPassword", { id });
};

const forgotPass = async (req, res) => {
  const id = req.session.User_id;

  const user = await User.findOne({ _id: id });
  const categories = await Category.find();
  const wishlist = await wishlistModel.findOne({ userId: id }).populate("items");
  const products = await Product.find({ isActive: true });
  const cart = await Cart.find({ user: id }).populate("product");


  const email = req.body.email;
  console.log(email);
  const document = await User.findOne({ email });
  if (document) {
    mail.resetOTP(req, res, document);


    res.render('User/otp', {
      link: 'reset', document, categories,
      products,
      user,
      id,
      cart,
      wishlist,
      message: req.query.message,
    });
  } else {
    req.flash('error', 'Entered email does not exist');
    res.redirect('/forget');
  }
};

const resendOtp = (req, res) => {
  const { user } = req;
  sendOTP(req, res, user.email);
  req.flash('message', 'Otp send..Please check..!!');
  res.redirect('/otp');
};

const otpVerifyPage = async (req, res) => {
  const id = req.session.User_id;
  const user = await User.findOne({ _id: id });
  const categories = await Category.find();
  const wishlist = await wishlistModel.findOne({ userId: id }).populate("items");
  const products = await Product.find({ isActive: true });
  const cart = await Cart.find({ user: id }).populate("product");

  const document = null;

  res.render('User/otp', {
    categories, link: 'login', document, products,
    user,
    id,
    cart,
    wishlist,
    message: req.query.message,
  });
};

const otpVerify = async (req, res) => {
  const enteredOTP =
    req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
  const user = await User.findOne({
    otpToken: enteredOTP,
    tokenExpires: { $gt: Date.now() },
  });
  if (user) {
    req.session.isOTPVerified = true;
    user.otpToken = undefined;
    user.tokenExpires = undefined;
    await user.save();
    res.redirect('/');
  } else {
    req.flash('error', 'Entered otp is incorrect/expired');
    res.redirect('/otp');
  }
};

const verifyEmail = async (req, res) => {
  const categories = await Category.find({});
  res.render('verifyEmail', { categories });
};


const resetPass = async (req, res) => {
  const email = req.query.email;
  console.log(email);
  const password = req.body.password;
  console.log(password);

  const document = await User.findOne({ email: email });
  console.log(document);
  if (document) {
    const newPass = await bcrypt.hash(password, 10);
    const changed = await User.findOneAndUpdate({ password: newPass });
    console.log(changed);
    res.render("User/userlogin", { message: null });
  } else {
    res.render("User/usersignup", { message: "Invalid User" });
  }
};

const resetOtpVerify = async (req, res) => {
  const user = req.query.id;
  const enteredOTP =
    req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
  const storedOTP = req.signedCookies.otpReset;
  const username = req.signedCookies.usernameReset;

  if (enteredOTP === storedOTP && username === user) {
    res.clearCookie(storedOTP); // Clear the OTP cookie
    res.clearCookie(username);
    res.redirect('/changePassword');
  } else {
    req.flash('error', 'Entered otp is incorrect');
    res.redirect('/otp');
  }
};

const viewChangePass = async (req, res) => {
  const validationHelper = validationHelpers.validationChecker;
  const categories = await Category.find({});
  res.render('User/passwordReset', { categories, validationHelper });
};

const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('errorObject', errors.array());
    return res.redirect('/changePassword');
  }
  const newPass = req.body.password;
  const repeatPass = req.body.passwordConfirm;

  if (newPass === repeatPass) {
    const username = req.signedCookies.usernameReset;
    const updateUser = await User.findOne({ email: username });
    await updateUser.setPassword(newPass);
    await updateUser.save();
    res.clearCookie(username);
    req.flash('success', 'Password reset Success!!');
    res.redirect('/');
  } else {
    req.flash('error', 'Passwords do not match.Try again!!');
    res.redirect('/changePassword');
  }
};

const errorMessage = (req, res) => {
  res.render("User/404page")
};

const validateResetPass = [
  body('password', 'Password Cannot be Blank!').notEmpty().escape(),
  body('passwordConfirm', 'Confirmed Password cannot be blank!')
    .notEmpty()
    .escape(),
];

const aboutPage = async (req, res) => {
  try {
    const userId = req.session.User_id
    const user = await User.findOne({ _id: userId })
    const cart = await Cart.find({ user: userId }).populate("product");
    const wishlist = await wishlistModel.findOne({ userId: userId }).populate("items");
    res.render("User/aboutPage", { cart, wishlist, user });

  } catch (error) {
    res.redirect('/errorPage');
  }
}

const contactPage = async (req, res) => {
  try {
    const userId = req.session.User_id
    const user = await User.findOne({ _id: userId })
    const cart = await Cart.find({ user: userId }).populate("product");
    const wishlist = await wishlistModel.findOne({ userId: userId }).populate("items");
    res.render("User/contact", { cart, wishlist, user });

  } catch (error) {
    res.redirect('/errorPage');
  }
}
module.exports = {
  signup,
  createUser,
  verifyLogin,
  userLogout,
  loadHome,
  successEmail,
  getUserProfile,
  profileEdit,
  updatedProfile,
  getAddAddress,
  addAddress,
  getEditAddress,
  editAddress,
  deleteAddress,
  forget,
  forgotPass,
  otpVerifyPage,
  otpVerify,
  resetOtpVerify,
  viewChangePass,
  changePassword,
  verifyEmail,
  resendOtp,
  validateResetPass,

  resetPass,
  errorMessage,
  aboutPage,
  contactPage
};
