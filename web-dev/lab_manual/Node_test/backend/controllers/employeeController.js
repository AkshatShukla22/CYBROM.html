const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Salary = require('../models/Salary');

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('department')
      .populate('salary')
      .sort({ createdAt: -1 });
    res.render('index', { employees });
  } catch (error) {
    res.status(500).send('Error fetching employees');
  }
};

exports.getAddEmployee = async (req, res) => {
  try {
    const departments = await Department.find();
    res.render('add', { departments });
  } catch (error) {
    res.status(500).send('Error loading form');
  }
};

exports.postAddEmployee = async (req, res) => {
  try {
    const { name, position, department, hireDate, age, email, salaryAmount } = req.body;

    if (!name || !position || !department || !hireDate || !age || !email || !salaryAmount) {
      return res.status(400).send('All fields are required');
    }

    const salary = new Salary({ amount: salaryAmount });
    await salary.save();

    const employee = new Employee({
      name,
      position,
      department,
      hireDate,
      age,
      email,
      salary: salary._id
    });

    await employee.save();
    res.redirect('/employees');
  } catch (error) {
    res.status(500).send('Error adding employee: ' + error.message);
  }
};

exports.getEditEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department')
      .populate('salary');
    const departments = await Department.find();
    
    if (!employee) {
      return res.status(404).send('Employee not found');
    }

    res.render('edit', { employee, departments });
  } catch (error) {
    res.status(500).send('Error loading employee');
  }
};

exports.postEditEmployee = async (req, res) => {
  try {
    const { name, position, department, hireDate, age, email, salaryAmount } = req.body;

    if (!name || !position || !department || !hireDate || !age || !email || !salaryAmount) {
      return res.status(400).send('All fields are required');
    }

    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).send('Employee not found');
    }

    await Salary.findByIdAndUpdate(employee.salary, { amount: salaryAmount });

    employee.name = name;
    employee.position = position;
    employee.department = department;
    employee.hireDate = hireDate;
    employee.age = age;
    employee.email = email;

    await employee.save();
    res.redirect('/employees');
  } catch (error) {
    res.status(500).send('Error updating employee: ' + error.message);
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).send('Employee not found');
    }

    await Salary.findByIdAndDelete(employee.salary);
    await Employee.findByIdAndDelete(req.params.id);
    
    res.redirect('/employees');
  } catch (error) {
    res.status(500).send('Error deleting employee');
  }
};