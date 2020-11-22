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
    

    if (!from){
        res.status(400).json({code:"Failed", message:"Missing from userame"});
    }else if (!to){
        res.status(400).json({code:"Failed", message:"Missing to userame"});
    }else if (!value){
        res.status(400).json({code:"Failed", message:"Value must not be blank"});
    }else{
        value = parseInt(value)
        var MoneyChange = UserForm.balance.available - value;
        if(MoneyChange >= 0 ){

            try {
                var feeTransfer = value*0.01;
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
        const fee = data.amount * 0.01;
        const totalAmount = fee + data.amount;
        var user = await UserModel.findByIdAndUpdate(data.userId,{
            $inc: {
                    "balance.available": - totalAmount,
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
    } catch (error) {
        return res.status(400).json({message:"Failed"});
    }
}