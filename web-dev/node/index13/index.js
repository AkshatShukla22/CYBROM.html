// Event module
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

// myEmitter.on('greet', (nm) => {
//     if(nm === "Akshat"){
//         console.log(`Hello there ${nm}! How can I help you?`);
//         myEmitter.emit('problem'); 

//     }
//     else{
//         console.log(`Hello there !`);
//     }
// });

// myEmitter.on('problem', () => {
//     console.log(`I need your help with my code.`);
// });

// myEmitter.emit('greet', 'Akshat'); 

// ==> Identifying opening on file event throuth event module
const fs = require('fs');
let rs = fs.createReadStream("./demo.txt");

rs.on('open', () => {
    console.log('File is open');
});

rs.emit("open");