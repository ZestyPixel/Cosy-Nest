const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require('passport');

router.get("/signup", (req, res)=> {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync( async (req, res)=> {
    try{
        let {username, email, password} = req.body;
        const newUser = new User({username, email});
        const registeredUser = await User.register(newUser, password);
        req.flash("success", "Registered, Welcome to Cosy Nest!");
        res.redirect("/listings");
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login", (req, res)=> {
    res.render("users/login.ejs");
});

router.post("/login", passport.authenticate("local", { //Using local strategy for authentication
    failureFlash: true, //Enables flash messages on failure
    failureRedirect: "/login" //Redirects to login page on failure
}), async (req, res)=> {
    req.flash("success", "Welcome Back!");
    res.redirect("/listings");
});

module.exports = router;