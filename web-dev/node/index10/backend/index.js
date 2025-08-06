const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const StuRoutes = require('./routes/stuRoutes');

const app = express();

mongoose.connect('mongodb+srv://akshatshukla8600:R6jcuSHNkSEvGGeA@cluster0.czcv5pw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error(' MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/students', StuRoutes);

const port = 8000;
app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
});
