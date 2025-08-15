const express = require('express');       // Importing Express
const app = express();                    // Creating app
const mongoose = require('mongoose');          
const stuRoutes = require('./routes/sturoutes'); 
const bodyparser = require("body-parser");


app.set('view engine', 'ejs');          // Setting EJS as the view engine

mongoose.connect("mongodb://127.0.0.1:27017/student")
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log(err));

// Use body-parser middleware to parse JSON and URL-encoded data
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.use('/', stuRoutes);        // Using router for root path


app.listen(9000, () => {
  console.log('Server is running on port 9000');
});