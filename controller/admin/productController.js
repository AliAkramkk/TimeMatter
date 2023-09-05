const product = require('../../model/productSchema');

const addProduct = async(req,res)=>{
    try{
    const categories = await category.find()
    res.render('Admin/addProduct',{message:"",category:categories})
         
} catch (error) {
    res.redirect('/errorPage');
}
};


module.exports ={
    addProduct
}