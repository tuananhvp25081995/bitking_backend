const mongoose = require("mongoose");
const TicketService = require('../services/TicketService')
const RoundModel = mongoose.model("RoundModel");

exports.Buy = async function (req, res) {
    let { bulkId, userId } = req.body
    let timeNow = Date.now()
    let checkRound = await RoundModel.findOne({
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
        console.log({ error: "You cannot buy ticket at this time" });
        res.status(400).json({ error: "You cannot buy ticket at this time" })
    }
    else {
        TicketService.UpdateTicket({ bulkId, userId, roundId })
        res.status(200).json({ message: "OK" })
    }
}