const mongoose = require("mongoose");
var md5 = require('md5');
const TicketService = require('../middle/TIcketService')
const UserModel = mongoose.model("UserModel");
const RoundModel = mongoose.model("RoundModel");


exports.Buy = async function (req, res) {
    var userId = req.body.userId;
    var ticket = req.body.ticket;
    let timeNow = Date.now()
    var checkRound = await RoundModel.findOne({
        $and: [
            {
                "roundStartTime": { $lte: timeNow }
            },
            {
                "roundEndTime": { $gt: timeNow }
            }
        ]
    });

    // console.log(checkRound);
    if (!checkRound) {
        console.log("null checkRound");
        return res.status(400).json({ error: "cannot found round id" })
    }
    let roundId = checkRound.roundId

    if (!userId) {
        res.status(400).json({ error: "Missing userId" })
    } else if (checkRound.active !== true) {
        res.status(400).json({ error: "You cannot buy ticket at this time" })
    }
    else if (!ticket) {
        res.status(400).json({ error: "Ticket must be not null" })
    }
    else if (ticket > 1) {
        res.status(400).json({ error: "Too fast" })
    }
    else if (!roundId) {
        res.status(400).json({ error: "Cannot found round id" })
    }
    else {
        try {
            TicketService.UpdateTicket({ valTicket: ticket, userId, roundId })
        } catch (err) {
            console.log("err in Updateticket", err);
            return res.status(400).json({ message: "something went wrong" })
        }

        res.status(200).json({ message: "OK" })
    }

}