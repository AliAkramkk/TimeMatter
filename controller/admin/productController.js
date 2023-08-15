const product = require('../../model/productSchema');

const addProduct = async(req,res)=>{
    const categories = await category.find()
    res.render('Admin/addProduct',{message:"",category:categories})
}


module.exports ={
    addProduct
}