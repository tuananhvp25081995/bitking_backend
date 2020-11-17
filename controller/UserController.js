const mongoose = require("mongoose");
var md5 = require('md5');
const UserModel = mongoose.model("UserModel");
const TicketModel = mongoose.model("ticketModel");
const RoundModel = mongoose.model("RoundModel");
var randomNumber = require('randomstring');

exports.Transfer = async function(req, res){
    let from = req.body.from;
    let to = req.body.to;
    let value = req.body.value;

    if (!from){
        res.status(400).json({code:"Failed", message:"Missing from userame"});
    }else if (!to){
        res.status(400).json({code:"Failed", message:"Missing to userame"});
    }else if (!value){
        res.status(400).json({code:"Failed", message:"Value must not be blank"});
    }else{
        try {
            await UserModel.findOneAndUpdate({userName:from},{
                $inc:{"balance.available": - value}
            });
            await UserModel.findOneAndUpdate({userName:to},{
                $inc:{"balance.available": + value}
            });
            res.status(200).json({message:"Success"});
        } catch (err){
            console.log(err)
            res.status(400).json({message:"Failed"});
        }
    }


}