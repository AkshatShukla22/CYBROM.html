const stuModel = require('../model/stuModel');

const stuSave = async (req, res) => {
    const { name, rollno, city, fees } = req.body;
    const Stident = await stuModel.create({
        name: name,
        rollno: rollno,
        city: city,
        fees: fees
    });
    console.log("Data received:", req.body);
    res.send("Data saved successfully!");
  };

module.exports = {
    stuSave 
}; 

