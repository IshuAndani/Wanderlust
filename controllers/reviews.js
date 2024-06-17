//models
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.newReview = async (req,res,next) => {
    let id = req.params.id;
    let newReview = new Review({ createdBy : res.locals.user , ...req.body.review });
    let listing = await Listing.findById(id);
    await listing.reviews.unshift(newReview);
    await newReview.save();
    await listing.save();
    console.log("New review added");
    req.flash("reviewSuccess", "Review added successfully!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteReview = async (req,res, next) => {
    let {id, reviewId} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    let review = await Review.findByIdAndDelete(reviewId);
    console.log("review deleted : " + review);
    req.flash("reviewSuccess", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
}