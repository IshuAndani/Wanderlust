//modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

//utils
const ExpressError = require("./utils/ExpressError.js");

//routes
const listings = require("./routes/listing.js");
const reviews = require("./routes/reviews.js");

const app = express();
const port = 3000;
const dbName = "wanderlust";
const MONGO_URL = `mongodb://localhost:27017/${dbName}`;
const sessionOptions = {
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires : Date.now() + 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true
    }
  }

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

app.get("/", (req, res) => {
    res.send("GET request working at root");
});

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.engine('ejs', engine);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session(sessionOptions));
app.use(cookieParser());
app.use(flash());

app.use((req,res,next) => {
    res.locals.listingSuccess = req.flash("listingSuccess");
    res.locals.reviewSuccess = req.flash("reviewSuccess");
    res.locals.error = req.flash("error");
    next();
})

app.use("/listings", listings);
app.use("/listings/:id/review", reviews);

app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err,req,res,next) => {
    let {status = 500, message = "Something went wrong"} = err;
    res.status(status).render("error.ejs", {error : message});
});

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});