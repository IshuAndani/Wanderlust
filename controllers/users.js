//models
const User = require("../models/user");

module.exports.renderAuthenticationForm =  (req, res) => {
    res.render("authenticate.ejs");
}

module.exports.signUp = async (req,res,next) => {
    try{
        let {username, email, password} = req.body;
        let user = new User({
            email : email,
            username : username
        });
        let registeredUser = await User.register(user, password);
        req.logIn(registeredUser, (err) => {
            if(err){
                next(err);
            }
            else{
                console.log("new User registered : ", registeredUser);
                req.flash("listingSuccess", "Welcome to Wanderlust!");
                if(res.locals.redirectUrl){
                    res.redirect(res.locals.redirectUrl);
                }else{
                    res.redirect("/listings");
                }
            }
        })
    }catch(err){
        req.flash("error", err.message);
        res.redirect("/users");
    }
}

module.exports.login = async(req,res) => {
    req.flash("listingSuccess", "LogIn Successful!");
    console.log("User logged in : ", req.user);
    if(res.locals.redirectUrl){
        res.redirect(res.locals.redirectUrl);
    }else{
        res.redirect("/listings");
    }
}

module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err){
            next(err);
        }
        else {
            console.log("logged out");
            req.flash("listingSuccess", "Logged Out Successfully!");
            res.redirect("/listings");
        }
    })
}