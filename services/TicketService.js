const mongoose = require("mongoose");
let md5 = require('md5');
const UserModel = mongoose.model("UserModel");
const TicketModel = mongoose.model("ticketModel");
const RoundModel = mongoose.model("RoundModel");
const UserRef = mongoose.model("UserRef");
let randomNumber = require('randomstring');
const WebSocketService = require("./ws.service");
const moment = require("moment");

exports.UpdateTicket = async function ({ userId, roundId, bulkId }) {
    console.log({ userId, roundId });
    let estTime = Date.now()

    let ticketVals = 10; // all money of ticket = 100%
    let referralBonus = ticketVals * 0.01; // money of referral = 1%
    let companyBonus = ticketVals * 0.03; // money of company = 4%
    let agencyBonus = ticketVals * 0.01; // money of agency = 1%
    let builder = ticketVals * 0.02; // money of builder = 2%
    let fundMoney = ticketVals * 0.44; // money of fund = 44 %

    // Update balance after buy ticket
    let user = await UserModel.findOneAndUpdate({
        _id: userId,
        "balance.available": { $gte: 10 }
    }, {
        $inc: {
            "balance.available": -10,
        }
    }, { new: true })
    //find User
    //if update success , create ticket
    if (user) { // 49% of total amount of tickets
        //get number of ticket before
        const countTicket = await TicketModel.find({ roundId }).countDocuments();
        console.log("number ticket in current round", countTicket);

        let roi = process.env.TICKET_VALUE * 0.49 / (countTicket + 1)
        let roiToTicket = roi
        if (roi >= 0.1) roiToTicket = 0.1
        let roileft = process.env.TICKET_VALUE * 0.49 - roiToTicket
        let newTicket = await TicketModel.create({
            userId,
            Code: randomNumber.generate({
                length: 15,
                charset: 'numeric'
            }),
            userName: user.userName,
            roundId,
            roi: roiToTicket,
            postionInRound: countTicket + 1,
            bulkId
        })
        //Convert and send to socket
        WebSocketService.sendToAllClient({
            action: "recent",
            data: {
                usermame: user.userName,
                bulkId,
                time: md5(newTicket.createdAt).toString().slice(0, 14)
            }
        });
        WebSocketService.sendToOneClient(userId, {
            action: "my-ticket",
            data: {
                userId: userId,
                ticketID: newTicket.Code,
                bulkId,
                hour: moment(newTicket.createdAt).format("HH:mm:ss"),
                day: moment(newTicket.createdAt).format("YYYY-MM-DD"),
                roi: newTicket.roi,
                createdAt: newTicket.createdAt
            }
        });


        let beforeTicket = await TicketModel.find({
            roundId,
            roi: { $lt: 0.1 },
            _id: { $ne: newTicket._id }
        }, {
            roi: 1,
            _id: 1
        })
        console.log("ticket roi <0.1", beforeTicket);

        for (tick of beforeTicket) {
            console.log("roileft before each for: ", roileft)

            if (!roileft) {
                console.log("roileft is 0, break forloop");
                break;
            }
            if (roileft <= roi) {
                let toAddTick = roileft
                if (tick.roi + toAddTick > 0.1) {
                    toAddTick = 0.1 - tick.roi
                    roileft -= toAddTick
                }
                await TicketModel.findByIdAndUpdate(tick._id, {
                    $inc: {
                        "roi": toAddTick
                    }
                })
                console.log("roileft <=roi, update success, break forloop");
                break
            }

            if (roileft > roi) {
                let toAddTick = roi
                if (tick.roi + toAddTick > 0.1) {
                    toAddTick = 0.1 - tick.roi
                }
                roileft -= toAddTick
                await TicketModel.findByIdAndUpdate(tick._id, {
                    $inc: {
                        "roi": toAddTick
                    }
                })
            }
        }


        //get users roi in round then send noti tu users
        TicketModel.aggregate([{ $match: { roundId } },
        {
            $group: {
                _id: "$userId",
                roi: { "$sum": "$roi" }
            }
            //add pipeline project only _id and roi
        }]).then(dataUserRoiBonnus => {
            for (userRoi of dataUserRoiBonnus) {
                WebSocketService.sendToOneClient(userRoi._id, {
                    action: "my-profit",
                    data: {
                        //?? why send userId
                        userId: userRoi._id,
                        profit: userRoi.roi,
                    },
                })
            }
            console.log("databonus", dataUserRoiBonnus);
        }).catch(e => {
            console.log(e);
        })



        if (user.ReferralId) {
            // update amount for referral
            UserModel.findOneAndUpdate({
                _id: user.ReferralId,
            }, {
                $inc: {
                    "balance.available": +referralBonus,
                },
                $push: {
                    tranferHistory: {
                        side: "in",
                        symbol: "USD",
                        total: referralBonus,
                        from: user.userName,
                        to: user.ReferralId,
                        time: Date.now(),
                        type: "ref",
                        note: "Received Referral from " + user.userName
                    }
                }
            }).catch(e => console.log(e))

            RoundModel.findOneAndUpdate({
                roundId: roundId,
            }, {
                $push: {
                    refLog: {
                        userRef: user.ReferralId,
                        amount: referralBonus
                    }
                }
            }).catch(e => console.log(e))

            UserModel.findOne({ _id: user.ReferralId })
                .then(userRef => UserRef.create({
                    UserId: user.ReferralId,
                    from: userId,
                    RoundId: roundId,
                    UserNameRef: user.userName,
                    NameUser: userRef.userName
                }))
                .catch(e => console.log(e))

        } else {
            console.log("this user don't have ref, add to com", user.userName);
            //if not have referral , update for fund company
            builder += referralBonus;
        }

        console.log('fundupdate', fundMoney)
        console.log('roileft after devide', roileft);

        RoundModel.findOneAndUpdate({
            roundId,
        }, {
            $inc: {
                "revenue.company": companyBonus,
                "revenue.builder": builder,
                "fund.agency": agencyBonus,
                "fund.total44": (fundMoney + roileft),
                "totalTicket": 1
            }
        }).then(fundUpdate => {
            if (fundUpdate) {
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
        })


        WebSocketService.sendToOneClient(user._id, {
            action: "notification",
            data: {
                message: "You bought a ticket success",
                type: "success"
            },
        })

    } else {
        console.log("user balance don't enough")
        WebSocketService.sendToOneClient(user._id, {
            action: "notification",
            data: {
                message: "Your balance don't enough",
                type: "failed"
            },
        })
    }

    console.log("timetake", Date.now() - estTime, "ms")
}
