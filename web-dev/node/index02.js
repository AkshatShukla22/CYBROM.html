// Built-in modules in Node.js allow you to create a simple HTTP server. Below is an example of how to set up a basic server that responds with "Hello, World!" when accessed.

// const http = require('http');
// const port = 8000;

// http.createServer((req, res) => {
//   res.write("<h1>Hello, World!</h1>");
//   res.end();
// }).listen(port);


// User-defined modules can also be used to extend functionality. Below is an example of how to create a user-defined module and use it in the server code.
const http = require('http');
const Nm = require('./index02test');   //ye hamne khud bnaya h module jisko yha call kiya h
const port = 8000;

http.createServer((req, res) => {
  res.write("<h1>Hello, World!</h1>");
  res.write("<h1>" + Nm.myName() + "</h1>");          // jo module hamne bnaya h uski function ko call kiya h
  res.write("<h1>" + Nm.myClass() + "</h1>");
  res.end();
}).listen(port);