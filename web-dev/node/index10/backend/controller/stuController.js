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

const getAllStudents = async (req, res) => {
  try {
    const students = await stuModel.find();
    res.status(200).json(students);
  } catch (err) {
    console.error(' Error fetching students:', err);
    res.status(500).send('Internal server error');
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await stuModel.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).send('Failed to update student');
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await stuModel.findByIdAndDelete(id);
    res.status(200).send('Student deleted successfully');
  } catch (err) {
    res.status(500).send('Failed to delete student');
  }
};

const updateStu = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await stuModel.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).send('Failed to update student');
  }
};

const deleteStu = async (req, res) => {
  try {
    const { id } = req.params;
    await stuModel.findByIdAndDelete(id);
    res.status(200).send('Student deleted successfully');
  } catch (err) {
    res.status(500).send('Failed to delete student');
  }
};


module.exports = { stuSave, getAllStudents, updateStu, deleteStu };
