const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require('./utils/ExpressError');
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local'); //We will use local strategy for username and password authentication which means we will 
// store the username and password in our database.
const User = require("./models/user.js");

const Mongo_URL = "mongodb://127.0.0.1:27017/cosyNest";

main().then(()=>{console.log("Connected To Db")}).catch(err => console.log(err));

async function main(){
    await mongoose.connect(Mongo_URL)
};

app.set("view engine", 'ejs')
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true})); //To parse the body of the request
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.locals._layoutFile = 'layouts/boilerplate'; //Global implementation of layout

const sessionOptions = {
    secret: "secretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //Cookie expires in 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000, //Cookie max age is 7 days
        httpOnly: true,
    },
};

app.get("/", (req, res)=>{
    res.send("Hello World");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());//Passport requires session to be used because it uses session to store user data and know if it is the same user across multiple requests.
passport.use(new localStrategy(User.authenticate()));//We are using the authenticate method which is added by passport-local-mongoose to our User model 
// to authenticate users.
passport.serializeUser(User.serializeUser());//This tells passport how to serialize(store) a user. 
// Again, this method is added by passport-local-mongoose to our User model.
passport.deserializeUser(User.deserializeUser());//This tells passport how to deserialize(delete) a user. 
// This method is also added by passport-local-mongoose to our User model.

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/demouser", async (req, res)=>{
    let fakeUsr = new User({
        email: "student@gmail.com",
        username: "student"
    });

    let registeredUser = await User.register(fakeUsr, "password");
    res.send(registeredUser);
});

app.use("/listings", listingsRouter); //This means whenever the route starts with /listings, use the listings router.
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.all(/.*/, (req, res, next)=>{ //1. This will match all routes and will throw an error for non existing routes. /.* / is a regex which matches all routes.
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next)=>{ //2. This is the error handling middleware, which will catch the error thrown from above middleware.
    let {statusCode = 500, message="Something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {err});
});

app.listen(8080, ()=>{
    console.log("Working");
});

