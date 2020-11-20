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
    }


}