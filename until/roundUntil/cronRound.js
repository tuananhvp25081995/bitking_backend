let cron = require('node-cron');
let mongoose = require("mongoose");
let RoundModel = mongoose.model("RoundModel");
let dayjs = require("dayjs")
let utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

let { uuid } = require("../until");

const cronRound = {};

let createRound = async () => {

    let d = dayjs().utc(0).add(1, "day")
    let year = d.get('year');
    let month = d.get('month');
    let date = d.get('date');
    let startCurrentDay = dayjs().utc(0).year(year).month(month).date(date).hour(0).minute(0).second(0).millisecond(0)
    let endCurrentDay = dayjs().utc(0).year(year).month(month).date(date).hour(17).minute(0).second(0).millisecond(0)
    console.log("start", startCurrentDay.format());
    console.log("end", endCurrentDay.format());

    timeNow = startCurrentDay.add(1, "hour").valueOf()

    let checkRound = await RoundModel.findOne({
        $and: [{
            "roundStartTime": { $lte: timeNow }
        }, { "roundEndTime": { $gt: timeNow } }]
    });

    if (checkRound) {
        return console.log("have model for feature round, cancel");
    }

    await RoundModel.create({
        roundId: uuid(),
        roundStartTime: startCurrentDay.valueOf(),
        roundEndTime: endCurrentDay.valueOf()
    });
}

cronCreateRound = () => {

    createRound()

    cron.schedule('0 0 23 * * *', () => {
        createRound()
    }, {
        timezone: "Etc/UTC"
    });
}

module.exports = { cronCreateRound, createRound };