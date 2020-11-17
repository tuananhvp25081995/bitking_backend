var express = require('express');
var router = express.Router();
const FuncController = require('../controller/FundController');

router.post('/divide', FuncController.Divide)

module.exports = router;