let createError = require('http-errors');
let express = require('express');
let path = require('path');
let logger = require('morgan');

require('dotenv').config();
//init modal
require('./model/User/UserModel');
require('./model/User/UserAffilateModel');
require('./model/Ticket/TicketModel');
require('./model/roundModel');

//cronjob
let cronRoundDivided = require("./until/roundUntil/cronRoundDivided")
const TicketController = require('./controller/TicketController');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/ticket/buy', TicketController.Buy);
app.get('/fund/divide', (req, res) => {
  res.send("got it")
  cronRoundDivided.roundDivide()
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

//Get Socket
require("./services/ws.service").connect(process.env.WS_PORT)

module.exports = app;
