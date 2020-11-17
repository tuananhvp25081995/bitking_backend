const mongoose = require("mongoose");
var md5 = require('md5');
const UserModel = mongoose.model("UserModel");
const TicketModel = mongoose.model("ticketModel");
const RoundModel = mongoose.model("RoundModel");
var randomNumber = require('randomstring');

exports.Divide = async function(req,res){
    const roundId = req.body.roundId;
    var Round = await RoundModel.findOne({roundId:roundId});
    var fundData = Round.fund.total44; // 100% of 44% from ticket

    // find lastest
    var newest_row = await TicketModel.find({roundId:roundId},{},{
        sort:{'createdAt':-1}
    }).limit(2);


    console.log(newest_row)
    res.status(200).json({message:"OK"})


}