const User = require('../model/userSchema')

const islogin =async (req,res,next)=>{
    




    try {
        if(req.session.User_id){
            next()
       
        }else{
            res.render('User/userlogin',{message: ""})
        }
    } catch (error) {
        console.log(error.message);
    }

}
const isAccess =async (req,res,next)=>{
    const id =req.session.User_id


const user=await User.findOne({_id:id});
if(user&&user.isAccess){
    next()


}else{
    res.render('User/userlogin',{message: ""})
}

}
module.exports={islogin,isAccess}