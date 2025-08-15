const stuModel = require('../models/stuModel');

const stuSave = async (req, res) => {
  try {
    const { name, rollno, city, fees } = req.body;
    console.log(" Received body:", req.body);
    const student = await stuModel.create({ name, rollno, city, fees });
    console.log(' Student saved:', student);
    res.send('Data saved successfully!');
  } catch (err) {
    console.error(' Error saving student:', err);
    res.send('Internal server error');
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await stuModel.find();
    res.json(students);
  } catch (err) {
    console.error(' Error fetching students:', err);
    res.send('Internal server error');
  }
};

const updateStu = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await stuModel.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.send('Failed to update student');
  }
};

const deleteStu = async (req, res) => {
  try {
    const { id } = req.params;
    await stuModel.findByIdAndDelete(id);
    res.send('Student deleted successfully');
  } catch (err) {
    res.send('Failed to delete student');
  }
};

// Controlling search operations from the frontend/search.jsx

module.exports = { stuSave, getAllStudents, updateStu, deleteStu };
