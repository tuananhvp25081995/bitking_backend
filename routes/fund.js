var express = require('express');
var router = express.Router();
let cronRound = require("../until/roundUntil/cronRoundDivided")

router.post('/divide', (req, res) => {
    cronRound.roundDivide()
    res.send("got it")
})

module.exports = router;