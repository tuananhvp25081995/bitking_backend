const mongoose = require("mongoose");
var md5 = require('md5');
const TicketService = require('../middle/TIcketService')
const UserModel = mongoose.model("UserModel");
const RoundModel = mongoose.model("RoundModel");


exports.Buy = async function(req,res){
    var userId = req.body.userId;
    var ticket = req.body.ticket;
    var roundId = req.body.roundId;
    var checkRound = await RoundModel.findOne({roundId:roundId});

    if (!userId){
        res.status(400).json({error:"Missing userId"})
    }else if (!checkRound){
        res.status(400).json({error:"cannot found round id"})
    } else if (checkRound.active !== true){
        res.status(400).json({error:"You cannot buy ticket at this time"})
    }
    else if (!ticket){
        res.status(400).json({error:"Ticket must be not null"})
        
    }
    else if(ticket > 1){
        res.status(400).json({error:"Too fast"})
    }
    else if (!roundId){
        res.status(400).json({error:"Cannot found round id"})
    }
    else{
        try{
            const ticketUpdate =  TicketService.UpdateTicket({valTicket:ticket,userId:userId,roundId:roundId})
        }catch(err){

            return res.status(400).json({message:"something went wrong"})
        }
        
        res.status(200).json({message:"OK"})
    }

}