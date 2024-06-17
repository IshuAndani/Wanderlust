const Listing = require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user");

const ExpressError = require("./ExpressError");
const {listingSchema, reviewSchema, userLoginSchema, userSignUpSchema} = require("./schema");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "Please login!");
        return res.redirect("/users");
    }
    else next();
} 

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req,res,next) => {
    const { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.user._id)){
        req.flash("error", "You don't have the access to modify this listing!");
        return res.redirect(`/listings/${id}`);
        // next(new ExpressError(401, "You don0t have the access to Update this listing!"));
    }
    next();
}

module.exports.isReviewer = async(req,res,next) => {
    let {id, reviewId} = req.params;
    let listing = await Listing.findById(id);
    let review = await Review.findById(reviewId);
    console.log(review || "nothing");
    if(!(review.createdBy.equals(res.locals.user._id) || listing.owner.equals(res.locals.user._id))){
        req.flash("error", "You don't have access to delete this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

//server-side validation middleware
module.exports.validateListing = (req,res,next) => {
    let results = listingSchema.validate(req.body);
    if(results.error){
        let errMsg = results.error.details.map(el => el.message).join(",");
        console.log(results.error);
        next(new ExpressError(400, errMsg));
    }
    next();
}

module.exports.validateReview = (req,res,next) => {
    let results = reviewSchema.validate(req.body);
    if(results.error){
        console.log(results.error.details);
        let errMsg = results.error.details.map(el => el.message).join(",");
        next(new ExpressError(400, errMsg));
    }
    next();
}

module.exports.validateUserLogin = (req,res,next) => {
    let results = userLoginSchema.validate(req.body);
    if(results.error){
        let errMsg = results.error.details.map(el => el.message).join(",");
        next(new ExpressError(400, errMsg));
    }
    next();
}

module.exports.validateUserSignUp = (req,res,next) => {
    console.log(req.body);
    let results = userSignUpSchema.validate(req.body);
    if(results.error){
        let errMsg = results.error.details.map(el => el.message).join(",");
        next(new ExpressError(400, errMsg));
    }
    next();
}