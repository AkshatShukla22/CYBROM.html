const express = require("express");
const app = express();
const bodyparser = require('body-parser');
const cors = require('cors');
const userRoute = require("./routes/userRoute");
const mongoose = require("mongoose");
require("dotenv").config();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("DB Connected!!!");
});

app.use("/user", userRoute);

const Port = process.env.PORT || 8000;
app.listen(Port, () => {
  console.log(`Server run on port ${Port}`);
});