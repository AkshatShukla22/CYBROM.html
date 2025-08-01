const stuModel = require('../models/stuModel');

const stuSave = async (req, res) => {
  try {
    const { name, rollno, city, fees } = req.body;

    console.log(" Received body:", req.body);

    const student = await stuModel.create({ name, rollno, city, fees: Number(fees) });

    console.log(' Student saved:', student);
    res.status(201).send('Data saved successfully!');
  } catch (err) {
    console.error(' Error saving student:', err);
    res.status(500).send('Internal server error');
  }
};

module.exports = { stuSave };
