const express = require('express');     // Importing the Express framework , // Express simplifies the process of creating a server and handling requests.
const app = express();                  // Creating an instance of an Express application

app.get('/home', (req, res) => {          
  res.send('<h1>Welcome to my Home Page! </h1>');  // Handling GET requests to the root URL and sending a response
});

app.get('/about', (req, res) => {          
  res.send('<h1>Welcome to my About Page! </h1>');  // Handling GET requests to the root URL and sending a response
});

app.get('/service', (req, res) => {          
  res.send('<h1>Welcome to my service page! </h1>');  // Handling GET requests to the root URL and sending a response
});

app.get('/Photo', (req, res) => {          
  res.send('<h1>Welcome to my photo page! </h1>');  // Handling GET requests to the root URL and sending a response
});

app.get('/contact', (req, res) => {          
  res.send('<h1>Welcome to my contact page! </h1>');  // Handling GET requests to the root URL and sending a response
});


app.listen(8000, () => {                  // Starting the server on port 8000
  console.log('Server is running on port 8000');
});