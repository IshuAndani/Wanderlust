const express = require("express");
const router = express.Router();

const {storage} = require("../cloudConfig.js");
const multer  = require('multer');
const upload = multer({storage});

//models
const Listing = require("../models/listing.js");

//utils
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../utils/middleware.js");

//controllers
const listingController = require("../controllers/listings.js");

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

router.get("/new", isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .patch(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing,  wrapAsync(listingController.editListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing))

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;