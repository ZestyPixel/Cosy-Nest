const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Listing = require("./Models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require('./utils/ExpressError');
const {listingSchema} = require('./schema.js');

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

app.get("/", (req, res)=>{
    res.send("Hello World");
});

const validateListing = (req, res, next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(',');
        throw new ExpressError(400, result.error);
    }else{
        next();
    }
}

//Index Route
app.get("/listings", wrapAsync(async(req, res)=>{ 
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//New Route
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", wrapAsync(async(req, res)=>{
    let {id} = req.params; //MongoDb auto gives every data an id.
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

//Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res, next)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async(req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data");
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing}); //Three dots is spread operator which spreads the object into key value pairs.
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async(req, res)=>{
    let{id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

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

