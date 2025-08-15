const express = require('express');
const router2 = express.Router();

router2.get('/teacherinfo', (req, res) => {
    res.send('<h1>Welcome to the Teacher Information Page</h1>');
});

router2.get('/address', (req, res) => {
    res.send('<h1>Welcome to the Teacher address Page</h1>');
});

router2.get('/sallery', (req, res) => {
    res.send('<h1>Welcome to the Teacher Sallery Page</h1>');
});

router2.get('/work', (req, res) => {
    res.send('<h1>Welcome to the Teacher Work Page</h1>');
});

router2.get('/department', (req, res) => {
    res.send('<h1>Welcome to the Teacher Department Page</h1>');
});


module.exports = router2;