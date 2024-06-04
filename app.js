const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const {listingSchema} = require("./schema.js");

//models
const Listing = require("./models/listing.js");

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
    let listing = await Listing.findById(id);
    if(!listing){
        next(new ExpressError(500, "No listing found"));
    }
    res.render("listings/view.ejs", { listing });
}));

app.patch("/listings/:id", validateListing,  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing, { new: true, runValidators: true });
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await Listing.findByIdAndDelete(id);
        res.redirect("/listings");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting listing");
    }
});

app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page not found"));
})

app.use((err,req,res,next) => {
    let {status = 500, message = "Something went wrong"} = err;
    // console.log(status,message,err);
    res.status(status).render("error.ejs", {error : message});
    // res.status(status).send(message);
})

app.get("/testListing", async (req, res) => {
    const sampleListing = new Listing({
        title: "Bridge",
        description: "RajaBhoj",
        price: 1200,
        location: "Bhopal",
        country: "India"
    });
    await sampleListing.save();
    console.log("Sample was saved");
    res.send("Successful testing");
});