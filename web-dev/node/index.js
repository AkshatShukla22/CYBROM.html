const http = require('http');
const port = 8000;

http.createServer((req, res) => {
  res.write("<h1>Hello World!</h1>");
  res.end();
}).listen(port);