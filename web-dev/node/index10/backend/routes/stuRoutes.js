const express = require('express');
const router = express.Router();
const stuController = require('../controller/stuController');

router.post('/save', stuController.stuSave);

router.get('/all', stuController.getAllStudents);

router.put('/update/:id', stuController.updateStu);
router.delete('/delete/:id', stuController.deleteStu);


module.exports = router;
