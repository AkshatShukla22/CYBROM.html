const express = require('express');
const app = express();

const stuRoutes = require('./routes/stuRoutes');
app.use('/students', stuRoutes);

app.listen(9000, () => {
  console.log('Server is running on port 9000');
});
