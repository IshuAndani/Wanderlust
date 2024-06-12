const express = require("express");
const router = express.Router({mergeParams : true});

//models
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

//utils
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isReviewer, validateReview} = require("../utils/middleware.js");

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

router.delete("/:reviewId", isLoggedIn, isReviewer, wrapAsync(async (req,res, next) => {
    let {id, reviewId} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    let review = await Review.findByIdAndDelete(reviewId);
    console.log("review deleted : " + review);
    req.flash("reviewSuccess", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;