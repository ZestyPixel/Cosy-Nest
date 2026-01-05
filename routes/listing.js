const express = require("express");
const router = express.Router();//To create a mini express app for routes
const wrapAsync = require("../utils/wrapAsync");
const {listingSchema} = require('../schema.js');
const ExpressError = require('../utils/ExpressError');
const Listing = require("../Models/listing");

const validateListing = (req, res, next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(','); //Here error.details is an array which contains all the error messages in an object.
        //map is used to extract only the message from each object and join is used to convert the array to string.
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//Index Route
router.get("/", wrapAsync(async(req, res)=>{ 
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//New Route
router.get("/new", (req, res)=>{
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async(req, res)=>{
    let {id} = req.params; //MongoDb auto gives every data an id.
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}));

//Create Route
router.post("/", validateListing, wrapAsync(async (req, res, next)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
router.put("/:id", validateListing, wrapAsync(async(req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data");
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing}); //Three dots is spread operator which spreads the object into key value pairs.
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id", wrapAsync(async(req, res)=>{
    let{id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

module.exports = router;