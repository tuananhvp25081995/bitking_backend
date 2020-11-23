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

    //get User from 
    var UserForm = await UserModel.findOne({userName:from});
    var UserTo = await UserModel.findOne({userName:to});
    value = parseFloat(value)
    var feeTransfer = value*0.01;
    

    if (!from){
        res.status(400).json({code:"Failed", message:"Missing from userame"});
    }else if (!to){
        res.status(400).json({code:"Failed", message:"Missing to userame"});
    }
    else if (to == from){
        res.status(400).json({code:"Failed", message:"you cannot create transaction for yourself"});
    }else if (!value){
        res.status(400).json({code:"Failed", message:"Value must not be blank"});
    }else{
       
        var MoneyChange = UserForm.balance.available - value - feeTransfer;
        if(MoneyChange >= 0 ){

            try {
                
                var log = await UserModel.findOneAndUpdate({userName:from},{
                    $inc:{"balance.available": - (value+feeTransfer),
                    },
                    $push:{tranferHistory :{
                        side:"out",
                        fee:feeTransfer,
                        total: value+feeTransfer,
                        from : from,
                        to : to,
                        time: Date.now()
                    }
                }
                });
                console.log(log);
                await UserModel.findOneAndUpdate({userName:to},{
                    $inc:{"balance.available": + value,
                    },
                    $push:{tranferHistory :{
                        side:"in",
                        total: value,
                        from : from,
                        to : to,
                        time: Date.now()
                    }
                }
                });
                
           
                res.status(200).json({message:"Success"});
            } catch (err){
                console.log(err)
                res.status(400).json({message:"Failed"});
            }
        } else{
            res.status(400).json({message:"Too much"});
        }
       
    }


}

exports.Withdrawal = async function(req, res){
    try {
        const data = req.body;
        if (!data.amount){
            return res.status(400).json({code:"Failed", message:"Missing amount"});
        }else if (!data.symbol){
            return res.status(400).json({code:"Failed", message:"Missing symbol"});
        }else if (!data.address){
            return res.status(400).json({code:"Failed", message:"Missing address"});
        }else if (!data.userId){
            return res.status(400).json({code:"Failed", message:"Missing userId"});
        }else{ 
            data.amount = parseFloat(data.amount)
            if (data.amount < 1) {
                return res.status(400).json({code:"Failed", message:"Minimum withdrawal = 1"});
            }
            const fee = data.amount * 0.01;
            var user = await UserModel.findByIdAndUpdate(data.userId,{
                $inc: {
                        "balance.available": - data.amount,
                },
                $push:
                {
                    withdrawal:
                    {
                        symbol: data.symbol,
                        fee: fee,
                        withdrawalValue: data.amount,
                        txHash: data.address,
                    }
                }
            });
            return res.status(200).json({message:"Success"});
        }
    } catch (error) {
        return res.status(400).json({message:"Failed"});
    }
}