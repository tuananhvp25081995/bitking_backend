var express = require('express');
var router = express.Router();
const TicketController = require('../controller/TicketController');

router.post('/buy', TicketController.Buy);


module.exports = router;