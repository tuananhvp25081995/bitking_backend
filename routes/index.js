var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const RoundModel = mongoose.model("RoundModel");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/create_round', function (req, res, next){
  const round = new RoundModel({
    roundId:'adaedas2qwas',
  })
  round.save()
})

module.exports = router;
