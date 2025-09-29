const http = require('http');
const cluster = require('cluster');

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  cluster.fork();
  cluster.fork();
  cluster.fork();
}
else {  console.log(`Worker ${process.pid} started`);  
  http.createServer((req, res) => {
    setTimeout(() => {
      res.write(`<h1>Hello, World!</h1>`);
      res.end();
    }, 5000);
  }).listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
  });
}