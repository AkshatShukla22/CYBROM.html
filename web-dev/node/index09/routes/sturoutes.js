const express = require('express');
const route = express.Router(); 
const stucontroller  = require("../controller/stucontroller");

route.get("/", stucontroller.homePage);
route.get("/insert", stucontroller.insertPage);
route.get("/display", stucontroller.displayStu);


route.post("/save", stucontroller.stuSave);
route.get("/delete/:id", stucontroller.deleteStu);
route.get("/edit/:id", stucontroller.editPage);      
route.post("/update/:id", stucontroller.updateStu);

module.exports = route;