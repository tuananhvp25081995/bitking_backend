let cron = require('node-cron');
let mongoose = require("mongoose");
let RoundModel = mongoose.model("RoundModel");
const DivedService = require('../../services/fundServices')



let roundDivide = async () => {
    //get date now
    const activeRound = await RoundModel.findOne({ active: true });
    if (!activeRound) {
        return console.log(`currently didn't have any round active~`);
    }
    await DivedService.DivedRound({ roundId: activeRound.roundId });
}


let createCronRoundDivided = () => {
    console.log("cron divide enabled");
    cron.schedule('5 30 17 * * *', async () => {
        roundDivide()
    }, {
        timezone: "Etc/UTC"
    });
}

createCronRoundDivided()


module.exports = { createCronRoundDivided, roundDivide };