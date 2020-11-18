const mongoose = require("mongoose");
var md5 = require('md5');
const UserModel = mongoose.model("UserModel");
const TicketModel = mongoose.model("ticketModel");
const RoundModel = mongoose.model("RoundModel");
var randomNumber = require('randomstring');
const WebSocketService = require("../services/ws.service");
const moment = require("moment");

var sparkles = require('sparkles')();

exports.UpdateTicket = async function (req, res) {
    var tickes = req.valTicket;
    var userid = req.userId;
    var roundId = req.roundId;
    //amout
    let ticketVals = tickes * process.env.TICKET_VALUE; // all money of ticket = 100%
    let referralBonus = ticketVals * 0.01; // money of referral = 1%
    let companyBonus = ticketVals * 0.04; // money of company = 4%
    let builder = ticketVals * 0.02; // money of builder = 2%
    let fundMoney = ticketVals * 0.46; // money of fund = 46 %


    // Update balance after buy ticket
    const ticketUpdate = await UserModel.findOneAndUpdate({
        _id: userid,
        "balance.available": {$gte: ticketVals}
    }, {
        $inc: {
            "balance.available": -ticketVals,

        }
    })
    //if update success , create ticket
    let ticketdividedLeft = 0;
    if (ticketUpdate !== null) { // 49% of total amount of tickets
        //get number of ticket before
        for (let i = 1; i <= tickes; i++) {
            sparkles.emit('add_ticket', { my: 'event' });
            const countTicket = await TicketModel.find({roundId: roundId}).countDocuments();
            console.log("count",countTicket);
            let roi = process.env.TICKET_VALUE * 0.49 / (countTicket + 1)
            const ticket = await TicketModel.create({
                UserId: userid,
                Code: randomNumber.generate({
                    length:15,
                    charset : 'numeric'
                }),
                roi : roi,
                roundId: roundId,
                postionInRound : countTicket + 1
            })
            const user = await UserModel.findById(userid);
            //Convert and send to socket
            WebSocketService.sendToAllClient({
                action: "recent",
                data: {
                    usermame: user.userName,
                    roi: "Active",
                    time: moment(ticket.createdAt).format("YYYY-MM-DD HH:mm:ss")
                },
            });
            let hour = moment(ticket.createdAt).format("HH:mm:ss");
            let day = moment(ticket.createdAt).format("YYYY-MM-DD");
            WebSocketService.sendToOneClient(userid,{
                action: "my-ticket",
                data: {
                    userId: userid,
                    ticketID: ticket.Code,
                    hour: hour,
                    day: day,
                    roi: ticket.roi 
                },
            });

            // await ticket.save();
            const dataUpdate = await TicketModel.updateMany({
                roundId: roundId,
                "roi" : {$lte: 10.7}
            },{
                $inc:{"roi":roi}
            })

            console.log("data",dataUpdate.nModified)
            ticketdividedLeft += (countTicket - dataUpdate.nModified)*roi

        }
        //find affilate
        const affilate = await UserModel.findOne({_id:userid});
    
    
        sparkles.emit('my-event', { my: 'event' });
        if (affilate.ReferralId !== ''){
    
            // update amount for referral
            const Referral = await UserModel.findOneAndUpdate({
                _id: affilate.ReferralId,
                // "balance.available": {$gte: ticketVals * 0.01}
            },{
                $inc: {
                    "balance.available": + referralBonus,
                }
            })
        } else{
            //if not have referral , update for fund company
            builder += referralBonus;
        }
        console.log(companyBonus)
        //get amount to company
        const fundUpdate =  await RoundModel.findOneAndUpdate({
                roundId : roundId,
            },{
                $inc: {
                    "revenue.company": + companyBonus,
                    "revenue.builder": + builder,
                    "fund.total44" :  (fundMoney + ticketdividedLeft),
                }
            },
            {new:true}
        )
        if(fundUpdate){
            //Convert and send to socket
            let fundMoneyArray = fundUpdate.fund.total44.toFixed(2).toString().replace(".","").split("").reverse();
            let dataSocket = ["0","0","0","0","0","0","0","0","0"];
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


}