const express = require('express');
const app = express();
const StuRoutes = require('./routes/stuRoutes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
import cores from 'cors';

mongoose.connect('mongodb://localhost:27017/student').then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cores());

app.use('/students', StuRoutes);

const port = 8000;

app.listen(port, () => {
  console.log('Server is running on port 8000');
});