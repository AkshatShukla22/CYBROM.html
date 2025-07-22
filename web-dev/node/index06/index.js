// Routes

const express = require('express');
const app = express();
const StuRoutes = require('./routes/stuRoutes');
const TechRoutes = require('./routes/techRoutes');
const Port = 9000;
app.use("/students", StuRoutes);
app.use("/teachers", TechRoutes);

app.listen(Port, () => { 
    console.log(`Server is running on port ${Port}`);
});