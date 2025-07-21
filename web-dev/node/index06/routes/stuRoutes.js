const express = require('express');
const router = express.Router();

router.get('/home', (req, res) => {
    res.send('<h1>Welcome to the Student Home Page</h1>');
});

router.get('/subjects', (req, res) => {
    res.send('<h1>Welcome to the Student Subjects Page</h1>');
});

router.get('/fees', (req, res) => {
    res.send('<h1>Welcome to the Student Fees Page</h1>');
});

router.get('/result', (req, res) => {
    res.send('<h1>Welcome to the Student Result Page</h1>');
});


module.exports = router;