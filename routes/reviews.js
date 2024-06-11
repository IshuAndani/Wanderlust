const express = require("express");
const router = express.Router({mergeParams : true});

//models
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

//utils
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {reviewSchema} = require("../utils/schema.js");
const {isLoggedIn} = require("../utils/middleware.js");

//server-side validation middleware
const validateReview = (req,res,next) => {
    let results = reviewSchema.validate(req.body);
    if(results.error){
        console.log(results.error.details);
        let errMsg = results.error.details.map(el => el.message).join(",");
        next(new ExpressError(400, errMsg));
    }
    next();
}

router.post("/", isLoggedIn, validateReview, wrapAsync(async (req,res,next) => {
    let id = req.params.id;
    let newReview = new Review({ createdBy : res.locals.user , ...req.body.review });
    let listing = await Listing.findById(id);
    await listing.reviews.unshift(newReview);
    await newReview.save();
    await listing.save();
    console.log("New review added");
    req.flash("reviewSuccess", "Review added successfully!");
    res.redirect(`/listings/${id}`);
}));

router.delete("/:reviewId", isLoggedIn, wrapAsync(async (req,res, next) => {
    let {id, reviewId} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    let review = await Review.findByIdAndDelete(reviewId);
    console.log("review deleted : " + review);
    req.flash("reviewSuccess", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;