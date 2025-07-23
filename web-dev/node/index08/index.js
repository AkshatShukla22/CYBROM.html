// EJS

const express = require('express');
const app = express();
const stuRoutes = require('./routes/stuRoutes');

app.set('view engine', 'ejs');

app.use("/", stuRoutes);


app.listen(9000, () => {
  console.log('Server is running on port 9000');
});
