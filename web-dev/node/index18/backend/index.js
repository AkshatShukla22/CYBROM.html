const http = require('http');
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  console.log(`Master is running`);
  const numCPUs = os.cpus().length;
  console.log(`Forking for ${numCPUs} CPUs`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
}
else {
  console.log(`Worker started ${process.pid}`);
  http.createServer((req, res) => {
    setTimeout(() => {
      res.write(`<h1>Hello, World!</h1>`);
      res.end();
      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        console.log('Starting a new worker');
        cluster.fork();
      });
    }, 5000);
  }).listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
  });
}