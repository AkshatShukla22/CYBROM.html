// use of .env

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express(); 
// imports keys or variables from the .env file

mongoose.connect(process.env.DB_CON)
    // use of .env to connect DB
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error(' MongoDB connection error:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 8000;
// use of .env to connect Port
app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
});
