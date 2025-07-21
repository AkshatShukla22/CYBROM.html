const express = require('express');
const route = express.Router();
const stucontroller = require("../controller/stucontroller");

route.get("/home", stucontroller.homePage);
route.get("/about", stucontroller.aboutPage);
route.get("/subject", stucontroller.subjectPage);
route.get("/fees", stucontroller.feesPage);

module.exports = route;
