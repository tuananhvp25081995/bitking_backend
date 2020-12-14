const mongoose = require("mongoose");
var md5 = require('md5');
const TicketService = require('../middle/TicketService')
const UserModel = mongoose.model("UserModel");
const RoundModel = mongoose.model("RoundModel");

exports.Buy = async function (req, res) {
    let { bulkId, userId } = req.body
    let timeNow = Date.now()
    var checkRound = await RoundModel.findOne({
        $and: [{
            "roundStartTime": { $lte: timeNow }
        }, { "roundEndTime": { $gt: timeNow } }]
    });
    if (!checkRound) {
        console.log("cannot found round id");
        return res.status(400).json({ error: "cannot found round id" })
    }
    let roundId = checkRound.roundId
    if (!userId) {
        res.status(400).json({ error: "Missing userId" })
    } else if (checkRound.active !== true) {
        res.status(400).json({ error: "You cannot buy ticket at this time" })
    } else if (!roundId) {
        res.status(400).json({ error: "Cannot found round id" })
    }
    else {
        try {
            await TicketService.UpdateTicket({ bulkId, userId, roundId })
        } catch (err) {
            console.log("err in Updateticket", err);
            return res.status(400).json({ message: "something went wrong" })
        }
        res.status(200).json({ message: "OK" })
    }
}