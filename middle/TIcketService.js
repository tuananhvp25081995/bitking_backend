const mongoose = require("mongoose");
var md5 = require('md5');
const UserModel = mongoose.model("UserModel");
const TicketModel = mongoose.model("ticketModel");
const RoundModel = mongoose.model("RoundModel");
const UserRef = mongoose.model("UserRef");
var randomNumber = require('randomstring');
const WebSocketService = require("../services/ws.service");
const moment = require("moment");

var sparkles = require('sparkles')();

exports.UpdateTicket = async function ({ valTicket, userId, roundId }) {
    console.log({ valTicket, userId, roundId });
    let tickes = parseInt(valTicket);

    //amount
    let ticketVals = tickes * 10; // all money of ticket = 100%
    let referralBonus = ticketVals * 0.01; // money of referral = 1%
    let companyBonus = ticketVals * 0.04; // money of company = 4%
    let builder = ticketVals * 0.02; // money of builder = 2%
    let fundMoney = ticketVals * 0.46; // money of fund = 46 %




    // Update balance after buy ticket
    const ticketUpdate = await UserModel.findOneAndUpdate({
        _id: userId,
        "balance.available": { $gte: ticketVals }
    }, {
        $inc: {
            "balance.available": -ticketVals,
        }
    })
    //if update success , create ticket
    let ticketdividedLeft = 0;
    if (ticketUpdate !== null) { // 49% of total amount of tickets
        //get number of ticket before
        sparkles.emit('add_ticket', { my: 'event' });
        const countTicket = await TicketModel.find({ roundId: roundId }).countDocuments();
        console.log("count", countTicket);
        let roi = process.env.TICKET_VALUE * 0.49 / (countTicket + 1)
        const ticket = await TicketModel.create({
            userId: userId,
            Code: randomNumber.generate({
                length: 15,
                charset: 'numeric'
            }),
            roi: roi,
            roundId: roundId,
            postionInRound: countTicket + 1
        })
        const user = await UserModel.findById(userId);
        //Convert and send to socket
        WebSocketService.sendToAllClient({
            action: "recent",
            data: {
                usermame: user.userName,
                roi: "Active",
                time: md5(ticket.createdAt).toString().slice(0, 14)
            }
        });
        let hour = moment(ticket.createdAt).format("HH:mm:ss");
        let day = moment(ticket.createdAt).format("YYYY-MM-DD");
        WebSocketService.sendToOneClient(userId, {
            action: "my-ticket",
            data: {
                userId: userId,
                ticketID: ticket.Code,
                hour: hour,
                day: day,
                roi: ticket.roi
            },
        });

        // await ticket.save();
        const dataUpdate = await TicketModel.updateMany({
            roundId: roundId,
            "roi": {$lte: 10.07}
        }, {
            $inc: { "roi": roi }
        })

        console.log("data", dataUpdate.nModified)
        if (countTicket > 0 && parseInt(countTicket) + 1 >= parseInt(dataUpdate.nModified)) {
            ticketdividedLeft += (parseInt(countTicket) + 1 - parseInt(dataUpdate.nModified)) * roi
        }


        //find affilate
        const affilate = await UserModel.findOne({ _id: userId });


        sparkles.emit('my-event', { my: 'event' });
        if (affilate.ReferralId !== '') {

            // update amount for referral
            const Referral = await UserModel.findOneAndUpdate({
                _id: affilate.ReferralId,
                // "balance.available": {$gte: ticketVals * 0.01}
            }, {
                $inc: {
                    "balance.available": +referralBonus,
                }
            })
            const rr = await RoundModel.findOneAndUpdate({
                roundId: roundId,
            },
                {
                    $push: {
                        refLog: {
                            userRef: affilate.ReferralId,
                            amount: referralBonus
                        }
                    }
                })
            await UserModel.findOneAndUpdate({
                _id:affilate.ReferralId,
            },
                {
                    $push:{
                        tranferHistory:{
                            side: "in",
                            symbol: "BKT",
                            fee: 0,
                            total: referralBonus,
                            from: userid,
                            to: affilate.ReferralId,
                            time:  Date.now() ,
                            type:  "ref",
                            note: "Received Referral from " + userid
                        }
                    }
                })
            await UserRef.create({
                UserId: affilate.ReferralId,
                from: userid,
                RoundId: roundId,
                Value: referralBonus,
            })

        } else {
            //if not have referral , update for fund company
            builder += referralBonus;
        }
        console.log('fundupdate', fundMoney)
        console.log('updattekeft', ticketdividedLeft);
        //get amount to company
        const fundUpdate = await RoundModel.findOneAndUpdate({
            roundId: roundId,
        }, {
            $inc: {
                "revenue.company": +companyBonus,
                "revenue.builder": +builder,
                "fund.total44": (fundMoney + ticketdividedLeft),
            }
        },
            { new: true }
        )
        if (fundUpdate) {
            //Convert and send to socket
            let fundMoneyArray = fundUpdate.fund.total44.toFixed(2).toString().replace(".", "").split("").reverse();
            let dataSocket = ["0", "0", "0", "0", "0", "0", "0", "0", "0"];
            let dataSocketLength = dataSocket.length - 1;
            for (const numb of fundMoneyArray) {
                dataSocket[dataSocketLength] = numb;
                dataSocketLength = dataSocketLength - 1;
            }
            WebSocketService.sendToAllClient({
                action: "count-money",
                data: dataSocket,
            })
        }
    }
    await RoundModel.findOneAndUpdate({ roundId: roundId }, {
        $inc: { "totalTicket": 1 }
    })

}