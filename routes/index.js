var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const RoundModel = mongoose.model("RoundModel");
let cronRoundDivided = require("../until/roundUntil/cronRoundDivided")
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use("/divide", (req, res) => {
  cronRoundDivided.roundDivide()
  res.send("ok")
})

router.get('/create_round', function (req, res, next) {
  const round = new RoundModel({
    roundId: 'adaedas2qwas',
  })
  round.save()
})

module.exports = router;
