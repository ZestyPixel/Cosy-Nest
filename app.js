const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require('./utils/ExpressError');
const listings = require("./routes/listing.js");
const reviews = require("./routes/reviews.js");

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

app.use("/listings", listings); //This means whenever the route starts with /listings, use the listings router.
app.use("/listings/:id/'reviews", reviews);

app.get("/", (req, res)=>{
    res.send("Hello World");
});

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

