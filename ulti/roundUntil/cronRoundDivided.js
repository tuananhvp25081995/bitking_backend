var cron = require('node-cron');
let mongoose = require("mongoose");
let RoundModel = mongoose.model("RoundModel");
const axios = require('axios').default;



const cronRoundDivided = {};

cronRoundDivided.createRoundDivided = () => {
    cron.schedule('0 0 17 * * *', async () => {
        //get round is actived
        const activeRound = await RoundModel.findOne({ active: true });
        const roundId = activeRound._id;

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // "X-API-Key": ApiConfig.CRYPTO_API_KEY
            },
            url: "https://api.bitkingreturns.com/fund/divide",
            data: {
                roundId: roundId,
            }
        }
        try {

            const res = axios(options);
            console.log("res")
            return res;
        } catch (err) {
            console.log("err")
        }
    }, {
        timezone: "Etc/UTC"
    });
}


module.exports = cronRoundDivided;