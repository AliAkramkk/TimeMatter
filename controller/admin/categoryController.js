const categoryModel = require('../../model/categorySchema');
const productModel  =require('../../model/productSchema');

    const loadCategory = async(req,res)=>{
        try {
            let productsValue =[];
            const categories = await categoryModel.find();

            for(let i=0; i< categories.length;i++){
                productsValue[i]=await productModel.findOne({category:categories[i]._id})
            }
            res.render('Admin/categories',{categories,productsValue})
        } catch (error) {
            res.redirect('/errorPage');
        }
    }

    const loadAddCategory = async(req,res)=>{
      
        res.render('Admin/addCategory',{message: ""})
    }

    const addCategory = async(req,res)=>{
        try {
            const catogeryName = req.body.name;

            const categoryData = await categoryModel.findOne({categoryName: {$regex:new RegExp(`${req.body.name}$`,"i")}})

            if(categoryData){
                res.render('Admin/addCategory',{message:"This category already exist"})
            }else{
                const newCategory = new categoryModel({
                    categoryName:catogeryName
                })
                await newCategory.save();
                res.redirect('/admin/category')
            }
        } catch (error) {
            res.redirect('/errorPage');
        }
    }
    const loadEditCategory = async(req,res)=>{
        try {
            const id = req.query.id;
            const categoryData = await categoryModel.findOne({_id: id});
            res.render('Admin/editCategory',{message:null,category: categoryData})
        } catch (error) {
            res.redirect('/errorPage');
        }
    }

    const editCategory = async (req,res)=> {
        try {
            
       const id = req.query.id;
        const newCategoryName = req.body.categoryName;
        // Check if the new category name is unique and doesn't already exist in the database
        const existingCategory = await categoryModel.findOne({ categoryName: { $regex: new RegExp(`^${newCategoryName}$`, "i") } });

        if (existingCategory) {
            // If the category name already exists, send an error message or handle it appropriately
            res.render('admin/editCategory', { message: "This category already exists", category: existingCategory });
        } else {
            // If the category name is unique, update the category in the database
            await categoryModel.findByIdAndUpdate(id, { categoryName: newCategoryName });
            res.redirect('/admin/category');

        }
        } catch (error) {
            res.redirect('/errorPage');
        }
    
    }


    module.exports={
        loadCategory,
        loadAddCategory,
        addCategory,
        loadEditCategory,
        editCategory
    }