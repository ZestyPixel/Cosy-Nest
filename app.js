const express = require("express");
const app = express();
const mongoose = require('mongoose');

const Mongo_URL = "mongodb://127.0.0.1:27017/cosyNest";

main().then(()=>{console.log("Connected To Db")}).catch(err => console.log(err));

async function main(){
    await mongoose.connect(Mongo_URL)
}

app.listen("/", (res, req)=>{
    res.send("Hello World");
});

app.listen(8080, ()=>{
    console.log("Working");
});
