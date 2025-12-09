const mongoose = require('mongoose');
const initData = require("./data.js");
const Listing = require("../Models/listing.js");

const Mongo_URL = "mongodb://127.0.0.1:27017/cosyNest";

main().then(()=>{console.log("Connected To Db")}).catch(err => console.log(err));

async function main(){
    await mongoose.connect(Mongo_URL)
};

const initDB = async() => {
    await Listing.deleteMany({}); //To wipe clean any previous data.
    await Listing.insertMany(initData.data);
    console.log("Data Initialised");
};

initDB();



