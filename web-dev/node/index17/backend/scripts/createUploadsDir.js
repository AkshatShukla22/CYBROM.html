// scripts/createUploadsDir.js - Run this once to create necessary directories
const fs = require('fs');
const path = require('path');

const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
};

// Create main uploads directory and subdirectories
const uploadsDir = path.join(__dirname, '..', 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const backgroundsDir = path.join(uploadsDir, 'backgrounds');

createDirectory(uploadsDir);
createDirectory(profilesDir);
createDirectory(backgroundsDir);

console.log('All upload directories are ready!');

module.exports = { createDirectory };