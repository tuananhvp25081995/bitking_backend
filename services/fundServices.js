const mongoose = require("mongoose");
const UserModel = mongoose.model("UserModel");
const TicketModel = mongoose.model("ticketModel");
const RoundModel = mongoose.model("RoundModel");
const UserRef = mongoose.model("UserRef");
let dayjs = require("dayjs")
var utc = require('dayjs/plugin/utc'); // dependent on utc plugin
dayjs.extend(utc)
exports.DivedRound = async function ({ roundId }) {

    console.log("start divide roundId:", roundId)
    if (!roundId) {
        return console.log({ message: "Round id cannot been null" })
    }

    try {
        let Round = await RoundModel.findOne({ roundId });
        if (!Round.active) {
            console.log(`round ${roundId} active: false => cancel divided`);
            return
        }

        let Allticket = await TicketModel.find({ roundId }, {
            userId: 1,
            roi: 1,
            userName: 1,
            createdAt: 1,
            bulkId: 1,
            postionInRound: 1
        }, { sort: { "createdAt": 1 } })
        Allticket.forEach(item => {
            console.log(`ticket postion ${item.postionInRound} ${item.userName} ${item.roi}`);
        })

        let fundData = Round.fund.total44; // 100% of 44% from ticket
        let agency = Round.fund.agency; //1% for all agency
        let dividedAll = fundData * 0.75; // divided all number
        let divided_1 = fundData * 0.1; // divided random 4-6%
        let divided_2 = fundData * 0.02; //for people don't claim
        let divided_3 = fundData * 0.02; //top1, last 1,2
        let divided_4 = fundData * 0.02; //top 20 ref
        let divided_5 = fundData * 0.03; // develop fund
        let divided_6 = fundData * 0.06; // quy khac, tong support thi truong

        console.log({ fundData, agency, dividedAll, divided_1, divided_2, divided_3, divided_4, divided_5, divided_6 });

        await RoundModel.findOneAndUpdate({ roundId }, {
            "devide.total75": dividedAll,
            "devide.total10": divided_1,
            "devide.totalAllleft": divided_2,
            "devide.totaltop3": divided_3,
            "devide.total2for20": divided_4,
            "fund.develop": divided_5,
            "fund.another": divided_6,
        })

        //get number of divided 10$
        let numberAll = Math.floor(dividedAll / 10);
        let leftAll = dividedAll - numberAll * 10;

        // update phần dư của chia hoàn vốn cho quỹ công ty
        if (leftAll > 0) {
            RoundModel.findOneAndUpdate({ roundId }, {
                $inc: {
                    "revenue.builder": leftAll
                }
            })
            dividedAll -= leftAll
        }

        for (tick of Allticket) {
            if (dividedAll >= 10) {
                let newTick = await TicketModel.findOneAndUpdate({ _id: tick._id },
                    {
                        $inc: { "roi": 10 }
                    }, { new: true })
                dividedAll -= 10
                console.log(`add 10$ to roi for user, ${tick.userName}, val after is: ${newTick.roi}, ticket postision ${tick.postionInRound} divide left: ${dividedAll}`);
            } else {
                console.log("divide all small than 10, break forloop", dividedAll);
                break
            }
        }

        //divideRandom4-6$ for ticket
        console.log("total divided_1 for 4-6$ ramdom", divided_1);
        let divideRandom4_6 = []
        while (divided_1 > 0) {
            const vals = Math.random() * 2 + 4;
            if (vals >= divided_1) {
                divideRandom4_6.push(divided_1)
                break
            }
            divided_1 -= vals
            divideRandom4_6.push(vals)
        }

        console.log("arr devide 4-6", divideRandom4_6);
        let allTicketNotDevide = await TicketModel.find({ "roi": { $lt: 10 }, roundId }, {
            roi: 1,
            userName: 1,
        })
        console.log({ allTicketNotDevide });
        for (tk of allTicketNotDevide) {
            if (!divideRandom4_6.length) break
            let val = Number(divideRandom4_6.shift())
            let t = await TicketModel.findOneAndUpdate({
                _id: tk._id,
            }, {
                $inc: { "roi": val }
            }, { new: true });
            console.log(`divide random ${val} for user ${t.userName} and roi after is: ${t.roi}, tick postision ${t.postionInRound}`);
        }
        console.log("divideRandom4_6 left after divide: ", divideRandom4_6);

        //for 2% all devide ticket đin't claim
        let allTicknot = await TicketModel.find({ "roi": 0.1, roundId }, {
            roi: 1,
            userName: 1,
            postionInRound: 1
        })
        let avg = divided_2 / allTicknot.length
        console.log("total 2%", divided_2, "2% for all tick have roi 0.1 avg is: ", avg, "for", allTicknot.length, "tickets");
        if (avg < 0 || avg === Infinity || !avg) {
            console.log("divided_2 out with avg is", { avg });
        } else {
            let allTicknot = await TicketModel.find({ "roi": { $lte: 0.1 }, roundId }, {
                roi: 1,
                userName: 1,
                postionInRound: 1
            })
            if (allTicknot) {
                console.log({ allTicknot });
                for (let tk of allTicknot) {
                    let t = await TicketModel.findOneAndUpdate({
                        _id: tk._id,
                    }, {
                        $inc: { "roi": avg }
                    }, { new: true });
                    console.log("2% for all for ticket roi 0.1", t.userName, "roi after:", t.roi, "ticket postision", t.postionInRound);
                }
            }
        }

        //first ticket and lastest 2 ticket
        let winner_vals = divided_4 / 3;
        console.log("top 3 val", winner_vals);
        let last1 = 0, last2 = 0

        if (Allticket.length === 2) {
            last1 = 1
        } else if (Allticket.length > 2) {
            last1 = Allticket.length - 2
            last2 = Allticket.length - 1
        }

        if (Allticket.length) {
            await UserModel.updateMany({
                $or: [{
                    _id: Allticket[last2].userId
                }, {
                    _id: Allticket[last1].userId
                }, {
                    _id: Allticket[0].userId
                }]
            }, {
                $inc: { "balance.available": winner_vals },
                $push: {
                    tranferHistory: {
                        symbol: "USD",
                        side: "in",
                        total: winner_vals,
                        from: "System",
                        to: "you",
                        type: "reward3",
                        time: Date.now(),
                        note: `Reward for last 2 ticket roundId: ${roundId}`
                    }
                }
            })
        }

        // // 2% to 20% max affilated
        let topAffilated = await UserRef.aggregate([{
            $match: {
                RoundId: Round._id,
            }
        },
        {
            $group: {
                _id: "$NameUser",
                totalValue: { $sum: 0.1 },
            }
        }, {
            $sort: {
                "totalValue": -1
            }
        }, {
            $limit: 20
        }])

        if (topAffilated.length) {
            let top20_val = divided_3 / topAffilated.length;
            console.log("top 20", { topAffilated, top20_val });
            let i = 1
            for (let u of topAffilated) {
                let updated = await UserModel.findOneAndUpdate({ userName: u._id }, {
                    $inc: { "balance.available": top20_val },
                    $push: {
                        tranferHistory: {
                            side: "in",
                            total: top20_val,
                            from: "System",
                            to: "You",
                            type: "reward20",
                            time: Date.now(),
                            note: `Reward top 20 with position: ${i}`
                        }
                    }
                })
                console.log(`user ${updated.userName} balance after send top 20 postision ${i} in ${roundId} is ${updated.balance.available} USD`);
                ++i;
            }
        } else {
            console.log("top 20 off");
        }

        Allticket = await TicketModel.find({ roundId }).lean()
        Allticket.forEach(async (item) => {
            console.log("postision", item.postionInRound, "update balance for user", item.userName, "value roi", item.roi);
            let u = await UserModel.findOneAndUpdate({ _id: item.userId }, {
                $inc: {
                    "balance.available": item.roi
                }
            })
            console.log(`user ${u.userName} balance after end round ${roundId} is ${u.balance.available} USD`);
        })


        if (divided_6) {
            console.log(`increase 6% for suport bitkingreturnsvn value ${divided_6} USD`);
            let u = await UserModel.findOneAndUpdate({ userName: "bitkingreturnsvn" }, {
                $inc: {
                    "balance.available": divided_6
                },
                $push: {
                    tranferHistory: {
                        symbol: "USD",
                        side: "in",
                        total: divided_6,
                        from: "System",
                        to: "You",
                        type: "marketsuport",
                        time: Date.now(),
                        note: `Support revenue of roundId ${roundId}`
                    }
                }
            })
            console.log(`user ${u.userName} balance after add fund in roundId ${roundId} is ${u.balance.available} USD`);
        }

        if (agency) {
            let today = dayjs().utc(0).toISOString();
            let endPackage = dayjs().utc(0).add(1, 'month').toISOString()
            let allAgency = await UserModel.find({
                $and: [
                    {
                        "agencyLog.time": { $gt: today }
                    }, {
                        "agencyLog.time": { $lte: endPackage }
                    }
                ]
            }, {
                userName: 1
            }).lean()

            console.log({ today, endPackage, allAgency });
            if (allAgency.length) {
                let avg = agency / allAgency.length
                console.log({ avg });
                if (!avg || avg <= 0 || avg === Infinity) {
                    console.log("avg false, off agency divide!", roundId);
                } else {
                    for (let one of allAgency) {
                        let u = await UserModel.findByIdAndDelete(one._id, {
                            $inc: {
                                "balance.available": avg
                            },
                            $push: {
                                tranferHistory: {
                                    symbol: "USD",
                                    side: "in",
                                    total: avg,
                                    from: "System",
                                    to: "You",
                                    type: "agency",
                                    time: Date.now(),
                                    note: `Agency revenue of roundId ${roundId}`
                                }
                            }
                        })
                        console.log(`user ${u.userName} balance after add agency revenue in roundId ${roundId} is ${u.balance.available} USD`);
                    }
                }
            } else {
                console.log("allAgency off");
            }
        }

        await RoundModel.findOneAndUpdate({ roundId }, { active: false });
    } catch (err) {
        console.log(err);
    }
}