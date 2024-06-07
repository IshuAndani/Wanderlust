const express = require("express");
const router = express.Router();

//models
const Listing = require("../models/listing.js");

//utils
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../utils/schema.js");

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

router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

router.post("/", validateListing,  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    console.log("New Listing saved");
    res.redirect("/listings");
}));

router.get("/:id/edit", wrapAsync(async (req, res, next) => {
    const id = req.params.id;
    let listing = await Listing.findById(id);
    if (listing) {
        res.render("listings/edit.ejs", { listing });
    } else {
        next(new ExpressError(404, "No listing found"))
    }
}));

router.get("/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate('reviews');
    if(!listing){
        next(new ExpressError(500, "No listing found"));
    }
    res.render("listings/view.ejs", { listing });
}));

router.patch("/:id", validateListing,  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing, { new: true, runValidators: true });
    console.log("Listing updated");
    res.redirect(`/listings/${id}`);
}));


router.delete("/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    if(!listing){
        next(new ExpressError(400, "No Listing matched the id."));
    }
    console.log("Listing Deleted");
    console.log(listing);
    res.redirect("/listings");
}));

module.exports = router;