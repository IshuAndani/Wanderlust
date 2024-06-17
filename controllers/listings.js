const { cloudinary } = require("../cloudConfig.js");
const { extractPublicId } = require("cloudinary-build-url");

//models
const Listing = require("../models/listing");

//utils
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = res.locals.user;
    newListing.image = req.file.path;
    await newListing.save();
    console.log("New Listing saved");
    req.flash("listingSuccess", "Listing Added Successfully!");
    res.redirect("/listings");
}

module.exports.showListing = async (req, res, next) => {
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
}

module.exports.renderEditForm = async (req, res, next) => {
    const id = req.params.id;
    let listing = await Listing.findById(id);
    if (listing) {
        let imageLink = listing.image;
        imageLink =  imageLink.replace("/upload", "/upload/h_150,w_200");
        res.render("listings/edit.ejs", { listing , imageLink });
    } else 
        req.flash("error", "Listing you requested for does not exist!");
        res.status(404).redirect("/listings");{
        // next(new ExpressError(404, "No listing found"))
    }
}

module.exports.editListing = async (req, res, next) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true, runValidators: true });
    if(typeof req.file != "undefined"){
        const publicId = extractPublicId(listing.image)
        cloudinary.uploader.destroy(publicId)
        .then(() => {
            console.log("image deleted from cloudinary");
        }).catch(err => {
            req.flash("error", "Error deleting listing image from cloudinary");
        });
        listing.image = req.file.path;
        await listing.save();
    }
    console.log("Listing updated");
    req.flash("listingSuccess", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req, res, next) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    if(!listing){
        next(new ExpressError(400, "No Listing matched the id."));
    }
    const publicId = extractPublicId(listing.image)
    cloudinary.uploader.destroy(publicId)
    .then(() => {
        console.log("image deleted from cloudinary");
    }).catch(err => {
        req.flash("error", "Error deleting listing image from cloudinary");
    });
    console.log("Listing Deleted");
    console.log(listing);
    req.flash("listingSuccess", "Listing Deleted Successfully!");
    res.redirect("/listings");
}