const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Listing = require("./Models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const Mongo_URL = "mongodb://127.0.0.1:27017/cosyNest";

main().then(()=>{console.log("Connected To Db")}).catch(err => console.log(err));

async function main(){
    await mongoose.connect(Mongo_URL)
};

app.set("view engine", 'ejs')
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.locals._layoutFile = 'layouts/boilerplate'; //Global implementation of layout

app.get("/", (req, res)=>{
    res.send("Hello World");
});

//Index Route
app.get("/listings", async (req, res)=>{ 
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});

//New Route
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", async(req, res)=>{
    let {id} = req.params; //MongoDb auto gives every data an id.
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
});

app.listen(8080, ()=>{
    console.log("Working");
});

//Create Route
app.post("/listings", async (req, res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

//Edit Route
app.get("/listings/:id/edit", async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

//Update Route
app.put("/listings/:id", async(req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing}); //Three dots is spread operator which spreads the object into key value pairs.
    res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id", async(req, res)=>{
    let{id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});
