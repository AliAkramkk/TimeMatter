const User = require("../../model/userSchema");
const bcrypt = require("bcrypt");
const mail = require("../../utility/sendEmail");
const Product = require("../../model/productSchema");
const Category = require("../../model/categorySchema");
const createdId = require("../../actions/createdId");
const Cart = require("../../model/cartSchema");
const wishlistModel =require("../../model/wishList");

const { log } = require("console");



const signup = async (req, res) => {
  res.render("User/usersignup", { message: "" });
};

const hashPassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  } catch (error) {
    console.log(error.message);
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
    console.log(error.message);
  }
};

// Existing user Login

const verifyLogin = async (req, res) => {
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
};

// Home if session, else Login
const loadHome = async (req, res) => {
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
};

// User Logout
const userLogout = async (req, res) => {
  try {
    req.session.User_id = null;
    res.clearCookie("User_id");
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const successEmail = async (req, res) => {
  res.render("User/successEmail", { message: req.params.username });
  const username = req.params.username;
  await User.findOneAndUpdate(
    { username: username },
    { $set: { isVerified: true } }
  );
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
    res.render("User/userProfile", { user, message: req.query.message,cart ,wishlist });
  } catch (error) {
    console.log(error.message);
  }
};

const profileEdit = async (req, res) => {
  try {
    const userId = req.session.User_id;
    const user = await User.findOne({ _id: userId });
    const cart = await Cart.find({ user: userId }).populate("product");
    const wishlist = await wishlistModel.findOne({ userId: id }).populate("items");
    if (!user) {
      return res.render("User/userlogin");
    }
   
    res.render("User/editProfile",{cart,wishlist,user});
  } catch (error) {
    console.log(error.message);
  }
};
const updatedProfile = async (req, res) => {
  const { username, email, password, newPassword } = req.body;
  console.log(username);
  console.log(email);
  console.log(password);
  console.log(newPassword);

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
  return res.redirect("/edit-Profile" );
};
const getAddAddress = async (req, res) => {
  const wishlist = await wishlistModel.findOne({ userId: id }).populate("items");
  const cart = await Cart.find({ user: userId }).populate("product");
  const redirect = req.query.redirect;
  res.render("User/addAddress", { redirect,wishlist ,cart});
};

const addAddress = async (req, res) => {
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
  console.log(redirect);
  res.redirect("/" + redirect);
};

const getEditAddress = async (req, res) => {
  const userId =req.session.User_id
  const redirect = req.query.redirect;
  const cart = await Cart.find({ user: userId }).populate("product");
  const wishlist = await wishlistModel.findOne({ userId: id }).populate("items");
  let { address } = await User.findOne(
    { "address.id": req.params.id },
    { _id: 0, address: { $elemMatch: { id: req.params.id } } }
  );

  res.render("user/editAddress", { key: "", address: address[0],redirect,cart,wishlist });
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
  console.log(redirect);
  res.redirect("/"+redirect);
  // res.redirect("/profile");
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
    res.redirect("/"+redirect);
  } catch (error) {
    console.log(error.message);
  }
};

const forget = async (req, res) => {
  res.render("User/forgotPassword");
};

const forgetverif = async (req, res) => {
  const email = req.body.email;
  console.log(email);
  const user = await User.findOne({ email });
  if (user) {
    console.log(user);
    const verify = await mail.changePass(user);
    res.send("check your email");
  }
};

const changePass = async (req, res) => {
  const email = req.params.email;
  res.render("User/newPass", { message: email });
  // await User.findOneAndUpdate({ email: email }, { $set: { isVerified: true } })
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
  forgetverif,
  changePass,
  resetPass,
};
