// MVC and connectivity with mongoDB

const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb://localhost:27017/student').then(() => {
  console.log('Connected to MongoDB');  
}).catch(err => {
  console.error('MongoDB connection error:', err);  
});

const stuRoutes = require('./routes/stuRoutes');
app.use('/students', stuRoutes);

app.listen(9000, () => {
  console.log('Server is running on port 9000');
});
