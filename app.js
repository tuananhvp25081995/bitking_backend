var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')


require('dotenv').config();
//init modal
require('./model/User/UserModel');
require('./model/User/UserAddressDetailModel');
require('./model/User/UserAffilateModel');
require('./model/Ticket/TicketModel');
require('./model/forwardHistory');
require('./model/roundModel');

//cronjob
const roundCron = require("./until/roundUntil/cronRound")
const cronRoundDivided = require("./until/roundUntil/cronRoundDivided")

var indexRouter = require('./routes/index');
var ticketRouter = require('./routes/ticket');
var fundRouter = require('./routes/fund');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/ticket', ticketRouter);
app.use('/fund', fundRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//Get Socket
require("./services/ws.service").connect(process.env.WS_PORT)
roundCron.cronCreateRound();
cronRoundDivided.createCronRoundDivided();

module.exports = app;
