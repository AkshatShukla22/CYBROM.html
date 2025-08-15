const express = require('express');
const router = express.Router();
const stuController = require('../controller/stuController');

router.get('/', stuController.homePage);
router.get('/contact', stuController.contactPage);
router.get('/about', stuController.aboutPage);

module.exports = router;