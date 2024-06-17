if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const router = express.Router();
const passport = require("passport");

//utils
const { saveRedirectUrl, validateUserLogin, validateUserSignUp } = require("../utils/middleware.js");

//controllers
const userController = require("../controllers/users.js");

router.get("/", userController.renderAuthenticationForm);

router.post("/signup", validateUserSignUp, saveRedirectUrl, userController.signUp);

router.post("/login", validateUserLogin, saveRedirectUrl, 
    passport.authenticate('local', { 
        failureRedirect: '/users' , 
        failureFlash : true
        }
    ), 
    userController.login
);

router.get("/logout", userController.logout);

module.exports = router;