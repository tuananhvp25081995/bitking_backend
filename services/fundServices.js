const mongoose = require("mongoose");
var md5 = require('md5');
const UserModel = mongoose.model("UserModel");
const TicketModel = mongoose.model("ticketModel");
const RoundModel = mongoose.model("RoundModel");
const Ref = mongoose.model("UserRef");
var randomNumber = require('randomstring');

exports.DivedRound = async function (req, res) {
    const roundId = req.roundId;


    if (!roundId) {
        res.status(400).json({message: "Round id cannot been null"});
    } else {
        try {
            var Round = await RoundModel.findOne({roundId: roundId, active: true});
            var fundData = Round.fund.total44; // 100% of 44% from ticket
            var Allticket = await TicketModel.find({roundId: roundId}).countDocuments();

            var dividedAll = fundData * 0.75; // divided all number
            var divided_1 = fundData * 0.1; // divided
            var divided_2 = fundData * 0.02;
            var divided_3 = fundData * 0.02;
            var divided_4 = fundData * 0.02;
            var divided_5 = fundData * 0.03; // develop fund
            var divided_6 = fundData * 0.06; // quy khac

            //get number of divided 10$
            const numberAll = Math.floor(dividedAll / 10);
            const leftAll = dividedAll - numberAll * 10;
            divided_1 += leftAll;
            //update nhung nguoi nhan du trong db
            // await TicketModel.updateMany({
            //     roundId: roundId,
            //     "postionInRound": {$lte: numberAll}
            // }, {
            //     $inc: {"roi": 10}
            // })

            //find all roi < 10 ;

            const Allticketvalid = await TicketModel.find({
                roundId: roundId,
                roi: {$lt: 10}
            }, {}, {sort: {"postionInRound": 1}})

            var amount = 0;
            for (item in Allticketvalid) {
                if (dividedAll > 0 || (dividedAll - amount) < 0) {
                    amount = 10 - Allticketvalid[item].roi;
                    await TicketModel.findOneAndUpdate({_id: Allticketvalid[item]._id},
                        {
                            $inc: {
                                "roi": amount,
                            }
                        })
                    dividedAll -= amount;
                }
            }

            //get max person when all divide 4
            let i = 1;

            while (Math.floor(divided_1 / 4) < 0 || Math.floor(divided_1 / 6) < 0) {
                const vals = Math.floor(Math.random() * 2) + 4;
                await TicketModel.updateOne({
                    roundId: roundId,
                    postionInRound: numberAll + i,
                }, {
                    $inc: {"roi": vals}
                });
                divided_1 -= vals;
                i++;
            }
            dividedAll
            if (divided_1 > 0) {
                divided_2 += divided_1;
            }

            let number_after_divide_2 = i + numberAll;


            let winner_vals = divided_4 / 3;
            // find lastest
            var lastest_row = await TicketModel.find({roundId: roundId}, {}, {
                sort: {'createdAt': -1}
            }).limit(2);

            //3nd
            for (i in lastest_row) {
                await UserModel.findOneAndUpdate({_id: lastest_row[i].UserId}, {
                    $inc: {"balance.available": winner_vals},
                    $push: {
                        tranferHistory: {
                            side: "in",
                            total: winner_vals,
                            from: "System",
                            to: lastest_row[i].UserId,
                            type: "reward3",
                            time: Date.now()
                        }
                    }
                })
            }
            var newest_row = await TicketModel.findOne({roundId: roundId}, {}, {
                sort: {'createdAt': 1}
            });
            await UserModel.findOneAndUpdate({_id: newest_row.UserId}, {
                $inc: {"balance.available": winner_vals},
                $push: {
                    tranferHistory: {
                        side: "in",
                        total: winner_vals,
                        from: "System",
                        to: newest_row.UserId,
                        type: "reward3",
                        time: Date.now()
                    }
                }
            });
            // 2% to 20% max affilated
            var all_affilated_round = await RoundModel.findOne({roundId: roundId});
            var total_deposit_affilated = JSON.parse(JSON.stringify(all_affilated_round.refLog));
            var affilated_round_data = {};



            for (item in total_deposit_affilated) {
                if (affilated_round_data[total_deposit_affilated[item].userRef]) {
                    affilated_round_data[total_deposit_affilated[item].userRef].count++
                } else {
                    affilated_round_data[total_deposit_affilated[item].userRef] = {count: 1}
                }
            }

            // console.log(affilated_round_data)


            //8% to left
            let var_update_left = divided_2 / (Allticket - i + numberAll);
            await TicketModel.updateMany({
                roundId: roundId,
                "postionInRound": {$lte: number_after_divide_2}
            }, {
                $inc: {"roi": var_update_left}
            })

            // 2% to develop fund
            await RoundModel.findOneAndUpdate({roundId: roundId}, {
                $inc: {
                    "fund.develop": divided_5,
                    "fund.another": divided_6,
                }
            })
            //update money to balance of user

            const Top20 = await Ref.aggregate([
                {$match: {RoundId: roundId}},
                {$group: {
                    _id: "$UserId",
                    totalAmount: {$sum: "$Value"}},},
                {$sort: { totalAmount: -1 } }
            ])

            if (Top20.length < 20) {
                var max_ref = divided_3 / Top20.length;
                for ( let e = 0; e<Top20.length ; e++){
                    await UserModel.findOneAndUpdate({_id:Top20[e]._id},{
                        $inc: {"balance.available": max_ref},
                        $push: {
                            tranferHistory: {
                                side: "in",
                                total: winner_vals,
                                from: "System",
                                to: Top20[e]._id,
                                type: "reward20",
                                time: Date.now()
                            }
                        }
                    })
                }
            } else if (Top20.length >= 20){
                var max_ref = divided_3 / 20;
                for ( let e = 0; e<20 ; e++){
                    await UserModel.findOneAndUpdate({_id:Top20[e]._id},{
                        $inc: {"balance.available": max_ref},
                        $push: {
                            tranferHistory: {
                                side: "in",
                                total: winner_vals,
                                from: "System",
                                to: Top20[e]._id,
                                type: "reward20",
                                time: Date.now()
                            }
                        }
                    })
                }
            }

            for (var item = 0; item < BalanceUser.length; item++) {
                var divideUserId = BalanceUser[item]._id;
                var divideAmount = BalanceUser[item].totalAmount;
                await UserModel.findOneAndUpdate({_id: divideUserId}, {
                    $inc: {
                        "balance.available": divideAmount
                    },
                    $push: {
                        tranferHistory: {
                            side: "in",
                            total: divideAmount,
                            from: "System",
                            to: divideUserId,
                            type: "normal",
                            time: Date.now()
                        }
                    }
                })
            }
            await RoundModel.findOneAndUpdate({roundId: roundId}, {active: false});

        } catch (err) {


        }

        //get all ticket in round

    }
}