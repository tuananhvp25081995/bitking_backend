var express = require('express');
var router = express.Router();
var UserController = require('../controller/UserController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/transfer',UserController.Transfer )
router.post('/withdrawal', UserController.Withdrawal);

module.exports = router;
