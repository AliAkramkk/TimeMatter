const islogin =(req,res,next)=>{
    try {
        if(req.session.User_id){
            next()
        // }else if(req.session.Admin){
        //     res.redirect('/admin')
        }else{
            res.render('User/userlogin',{message: ""})
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={islogin}