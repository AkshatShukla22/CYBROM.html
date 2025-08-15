//Read a file and send its content as a response ------------>>>>

// const http = require('http');
// const fs = require('fs'); // Built-in module for file system operations
// const port = 8000;

// http.createServer((req, res) => {
//     fs.readFile('raj.txt', (err, data) => {
//      if(err) throw err; // Handle error if file not found or read error
//      res.write(data);  //else write the content of the file to the response
//      res.end();
//     });

// }).listen(port);


// Create a file and write data to it ------------>>>>
// 1. by using appendFile method --->>>>
// const fs = require('fs'); // Built-in module for file system operations

// fs.appendFile('raj.txt', 'Hello, this is a new line!', (err) => { // or agr file nhi hoti is naam se to ek new file create hojati
//   if (err) throw err; // Handle error if file not found or write error
//   console.log('The "data to append" was appended to file!');
// });


//  2. by using open method   ---->>>>

// const fs = require('fs'); // Built-in module for file system operations

// fs.open('raju.txt', 'w', (err,file) => { // or agr file nhi hoti is naam se to ek new file create hojati
//   if (err) throw err; // Handle error if file not found or write error
//   console.log('The "file has been created!"');
// });


//  3. by using writeFile method   ---->>>>

// const fs = require('fs'); // Built-in module for file system operations
// fs.writeFile('raju.txt', 'Hello, this is a new line!', (err) => {  // or agr file nhi hoti is naam se to ek new file create hojati
//   if (err) throw err; // Handle error if file not found or write error
//   console.log('new file is created!');
// });


// DELETE a file ------------>>>> 
// const fs = require('fs');
// fs.unlink('raju.txt', (err) => {                   // or agr file nhi hoti is naam se to error throw hojata
//   if (err) throw err;                               // Handle error if file not found or delete error
//   console.log('File deleted!');
// });

// RENAME a file ------------>>>>
// fs.rename("ram.txt", "renmed.txt", (err) => {
//     if (err) throw err;
//     console.log("File read successfully!");
// });



// Note:--
// 1. fs.writeFile() method will replace the existing content of the file if it already exists, whereas fs.appendFile() method will add the new content to the end of the file without deleting the existing content.
// 2. fs.open() method is used to open a file and create it if it does not exist, but it does not write any content to the file. You can use fs.write() or fs.writeFile() after opening the file to write content to it.
// 3. fs.appendFile() method is used to append content to a file, and it will create the file if it does not exist. It is useful when you want to add new content to an existing file without overwriting the existing content.
// 4. fs.writeFile() method is used to write content to a file, and it will create the file if it does not exist. If the file already exists, it will overwrite the existing content with the new content you provide.
// 5. fs.readFile() method is used to read the content of a file, and it will return the content as a buffer or string, depending on the encoding you specify. It is useful when you want to read the content of a file and use it in your application.
// 6 . fs.unlink() method is used to delete a file, and it will remove the file from the file system. If the file does not exist, it will throw an error. It is useful when you want to remove a file that is no longer needed in your application.

