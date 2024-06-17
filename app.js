if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

//modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");

//models
const User = require("./models/user.js");

//utils
const ExpressError = require("./utils/ExpressError.js");

//routes
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const usersRouter = require("./routes/users.js");

const app = express();
const port = process.env.PORT || 3000;
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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.listingSuccess = req.flash("listingSuccess");
    res.locals.reviewSuccess = req.flash("reviewSuccess");
    res.locals.error = req.flash("error");
    res.locals.user = req.user;
    next();
})


app.use("/listings", listingsRouter);
app.use("/listings/:id", reviewsRouter);
app.use("/users", usersRouter);

app.get("/", (req,res,next) => {
    try{
        res.redirect("/listings");
    }catch(err){
        next(new ExpressError(500, "Error loading homepage"));
    }
})

app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err,req,res,next) => {
    let {status = 500, message = "Something went wrong"} = err;
    res.status(status).render("error.ejs", {err : message});
    console.log(err);
});

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});