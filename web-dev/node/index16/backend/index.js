const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const userRoute = require("./routes/userRoute");

mongoose.connect("mongodb://localhost:27017/testdb2").then(() => {
  console.log("DB Connected!!!");
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use("/user", userRoute)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const myupload = multer({
  storage: storage,
  limits: { fileSize: 3000000 } 
});

app.post("/upload", myupload.single("image"), (req, res) => {
  console.log("File succesfully uploaded!");
  res.send("OKKK");
});

const Port = 8000;
app.listen(Port, () => {
  console.log(`Server run on port ${Port}`);
});