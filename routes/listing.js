const express = require("express");
const router = express.Router();

//models
const Listing = require("../models/listing.js");

//utils
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../utils/schema.js");
const { isLoggedIn } = require("../utils/middleware.js");

//server-side validation middleware
const validateListing = (req,res,next) => {
    console.log(req.body);
    let results = listingSchema.validate(req.body);
    if(results.error){
        let errMsg = results.error.details.map(el => el.message).join(",");
        next(new ExpressError(400, errMsg));
    }
    next();
}

router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

router.post("/", isLoggedIn, validateListing,  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = res.locals.user;
    await newListing.save();
    console.log("New Listing saved");
    req.flash("listingSuccess", "Listing Added Successfully!");
    res.redirect("/listings");
}));

router.get("/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate('owner')
                                            .populate({
                                                path : "reviews",
                                                populate : {path : "createdBy"}
                                            });
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.status(404).redirect("/listings");
        // next(new ExpressError(500, "No listing found"));
    }
    console.log(listing);
    // console.log(res.locals.user);
    res.render("listings/view.ejs", { listing });
}));

router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res, next) => {
    const id = req.params.id;
    let listing = await Listing.findById(id);
    if (listing) {
        res.render("listings/edit.ejs", { listing });
    } else 
        req.flash("error", "Listing you requested for does not exist!");
        res.status(404).redirect("/listings");{
        // next(new ExpressError(404, "No listing found"))
    }
}));



router.patch("/:id", isLoggedIn, validateListing,  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing, { new: true, runValidators: true });
    console.log("Listing updated");
    req.flash("listingSuccess", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
}));


router.delete("/:id", isLoggedIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    if(!listing){
        next(new ExpressError(400, "No Listing matched the id."));
    }
    console.log("Listing Deleted");
    console.log(listing);
    req.flash("listingSuccess", "Listing Deleted Successfully!");
    res.redirect("/listings");
}));

module.exports = router;