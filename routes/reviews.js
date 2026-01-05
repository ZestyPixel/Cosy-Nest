const express = require("express");
const router = express.Router({mergeParams: true}); //What mergeParams does is it allows us to access params from parent router. 
//In this case, it allows us to access :id from /listings/:id/reviews route once we are inside this reviews router. 
//Without mergeParams, req.params inside tHE router would be an empty object.
const wrapAsync = require("../utils/wrapAsync");
const {reviewSchema} = require('../schema.js');
const ExpressError = require('../utils/ExpressError');
const Listing = require("../Models/listing");

const validateReview = (req, res, next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(','); //Turns array of messages into a single string
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//Reviews, POST route
router.post("/reviews", validateReview, wrapAsync(async(req, res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//Reviews, DELETE route
router.delete("/:reviewId", wrapAsync(async(req, res)=>{
    let{id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull : {reviews: reviewId}}); //This is the pull operator, what it does is it removes the value from the array which matches the value given.
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;