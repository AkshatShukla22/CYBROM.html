const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.mongo_DB).then(() => {
  console.log("DB Connected!!!");
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const Port = process.env.port || 8000;
app.listen(Port, () => {
  console.log(`Server run on port ${Port}`);
});