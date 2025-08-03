const express = require('express');
const router = express.Router();
const stuController = require('../controller/stuController');

router.post('/save', stuController.stuSave);

router.get('/all', stuController.getAllStudents);

module.exports = router;
