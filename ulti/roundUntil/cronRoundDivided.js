var cron = require('node-cron');
let mongoose = require("mongoose");
let RoundModel = mongoose.model("RoundModel");
const axios = require('axios').default;
const DivedService = require('../../services/fundServices')


const cronRoundDivided = {};

cronRoundDivided.createRoundDivided = () => {
    cron.schedule('0 0 17 * * *', async () => {

        //get date now
        var dateNow = Date.now();
        const activeRound = await RoundModel.findOne({
            "roundStartTime": {$lte: dateNow},
            "roundEndTime": {$gt: dateNow}
        });
        var roundId = activeRound._id;
        console.log(roundId)
        var result = await DivedService.DivedRound({roundId:roundId});

        console.log(result)




    }, {
        timezone: "Etc/UTC"
    });
}


module.exports = cronRoundDivided;