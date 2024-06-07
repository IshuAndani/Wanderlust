const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require('method-override');
const engine = require('ejs-mate');

//utils
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const {listingSchema} = require("./utils/schema.js");
const {reviewSchema} = require("./utils/schema.js");

//models
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

const app = express();
const port = 3000;
const dbName = "wanderlust";
const MONGO_URL = `mongodb://localhost:27017/${dbName}`;

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(methodOverride('_method'));

app.engine('ejs', engine);

async function main(){
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
    console.log(`database ${dbName} connected successfully`);
    })
    .catch(err => {
        console.log(err);
    });

const validateListing = (req,res,next) => {
    console.log(req.body);
    let results = listingSchema.validate(req.body);
    if(results.error){
        let errMsg = results.error.details.map(el => el.message).join(",");
        next(new ExpressError(400, errMsg));
    }
    next();
}

const validateReview = (req,res,next) => {
    let results = reviewSchema.validate(req.body);
    if(results.error){
        console.log(results.error.details);
        let errMsg = results.error.details.map(el => el.message).join(",");
        next(new ExpressError(400, errMsg));
    }
    next();
}

app.listen(port, () => {
    console.log(`listening to port ${port}`);
})

app.get("/", (req, res) => {
    res.send("GET request working at root");
});

app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

app.post("/listings", validateListing,  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    console.log("New Listing saved");
    res.redirect("/listings");
}));

app.get("/listings/:id/edit", wrapAsync(async (req, res, next) => {
    const id = req.params.id;
    let listing = await Listing.findById(id);
    if (listing) {
        res.render("listings/edit.ejs", { listing });
    } else {
        next(new ExpressError(404, "No listing found"))
    }
}));

app.get("/listings/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate('reviews');
    if(!listing){
        next(new ExpressError(500, "No listing found"));
    }
    res.render("listings/view.ejs", { listing });
}));

app.patch("/listings/:id", validateListing,  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing, { new: true, runValidators: true });
    console.log("Listing updated");
    res.redirect(`/listings/${id}`);
}));


app.delete("/listings/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    if(!listing){
        next(new ExpressError(400, "No Listing matched the id."));
    }
    console.log("Listing Deleted");
    console.log(listing);
    res.redirect("/listings");
}));

app.post("/listings/:id/rating", validateReview, wrapAsync(async (req,res,next) => {
    let id = req.params.id;
    let newReview = new Review(req.body.review);
    let listing = await Listing.findById(id);
    await listing.reviews.unshift(newReview);
    await newReview.save();
    await listing.save();
    console.log("New review added");
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:listingId/rating/:reviewId", wrapAsync(async (req,res, next) => {
    let {listingId, reviewId} = req.params;
    let listing = await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
    let review = await Review.findByIdAndDelete(reviewId);
    console.log("review deleted : " + review);
    res.redirect(`/listings/${listingId}`);
}));


app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page not found"));
})

app.use((err,req,res,next) => {
    let {status = 500, message = "Something went wrong"} = err;
    res.status(status).render("error.ejs", {error : message});
})