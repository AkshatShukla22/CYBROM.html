const express = require('express');
const app = express();
const route = express.Router();

const stuController = require('../controller/stuController');

route.post('/save', stuController.stuSave);

module.exports = route;
