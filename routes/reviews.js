const express = require("express");
const router = express.Router({mergeParams : true});

//utils
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isReviewer, validateReview} = require("../utils/middleware.js");

//controllers
const reviewController = require("../controllers/reviews.js");

router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.newReview));

router.delete("/:reviewId", isLoggedIn, isReviewer, wrapAsync(reviewController.deleteReview));

module.exports = router;