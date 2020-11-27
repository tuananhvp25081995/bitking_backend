var cron = require('node-cron');
let mongoose = require("mongoose");
let RoundModel = mongoose.model("RoundModel");
var { uuid } = require("../until");

const cronRound = {};

cronRound.createRound = () => {
  cron.schedule('0 0 0 * * *', async () => {


    var month = new Date().getUTCMonth();
    var year = new Date().getUTCFullYear();
    var day = new Date().getUTCDate();
    let startCurrentDay = new Date(Date.UTC(year, month, day, 0, 0, 0));
    let endCurrentDay = new Date(Date.UTC(year, month, day, 17, 0, 0));
    await RoundModel.create({
      roundId: uuid(),
      roundStartTime: startCurrentDay,
      roundEndTime: endCurrentDay

    });
  }, {
    timezone: "Etc/UTC"
  });

}

module.exports = cronRound;