const express = require("express");
const router = express.Router();
const passport = require("passport");

//models
const User = require("../models/user");

//utils
const ExpressError = require("../utils/ExpressError.js");
const { saveRedirectUrl, validateUserLogin, validateUserSignUp } = require("../utils/middleware.js");

router.get("/", (req, res) => {
    res.render("authenticate.ejs");
});

router.post("/signup", validateUserSignUp, saveRedirectUrl, (async (req,res,next) => {
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
}));

router.post("/login", validateUserLogin, saveRedirectUrl, passport.authenticate('local', { 
    failureRedirect: '/users' , 
    failureFlash : true
    }), 
    async(req,res) => {
        req.flash("listingSuccess", "LogIn Successful!");
        console.log("User logged in : ", req.user);
        if(res.locals.redirectUrl){
            res.redirect(res.locals.redirectUrl);
        }else{
            res.redirect("/listings");
        }
    }
);

router.get("/logout", (req,res,next) => {
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
})

module.exports = router;