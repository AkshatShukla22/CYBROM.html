const express = require('express');
const route = express.Router(); 
const stucontroller  = require("../controller/stucontroller");

route.get("/", stucontroller.homePage);
route.get("/insert", stucontroller.insertPage);


route.post("/save", stucontroller.stuSave);
module.exports = route;