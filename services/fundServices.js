const mongoose = require("mongoose");
const UserModel = mongoose.model("UserModel");
const TicketModel = mongoose.model("ticketModel");
const RoundModel = mongoose.model("RoundModel");

exports.DivedRound = async function ({ roundId }) {

    if (!roundId) {
        res.status(400).json({ message: "Round id cannot been null" });
    } else {
        try {
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

            var Round = await RoundModel.findOne({ roundId });
            if (!Round.active) {
                console.log(`round ${roundId} active: false => cancel divided`);
                return
            }

            var fundData = Round.fund.total44; // 100% of 44% from ticket
            let ticketClaimed = []
            var dividedAll = fundData * 0.75; // divided all number
            var divided_1 = fundData * 0.1; // divided random 4-6%
            var divided_2 = fundData * 0.02; //for people don't claim
            var divided_3 = fundData * 0.02; //top1, last 1,2
            var divided_4 = fundData * 0.02; //top 20 ref
            var divided_5 = fundData * 0.03; // develop fund
            var divided_6 = fundData * 0.06; // quy khac, tong support thi truong


            console.log("total to divide: ", fundData)
            console.log({ dividedAll, divided_1, divided_2, divided_3, divided_4, divided_5, divided_6 });

            await RoundModel.findOneAndUpdate({ roundId }, {
                "devide.total75": dividedAll,
                "devide.total10": divided_1,
                "devide.totalAllleft": divided_2,
                "devide.totaltop3": divided_3,
                "devide.total2for20": divided_4,
                "fund.develop": divided_5,
                "fund.another": divided_6,
            })


            let ticketDevidedCount = 0;


            //get number of divided 10$
            const numberAll = Math.floor(dividedAll / 10);
            const leftAll = dividedAll - numberAll * 10;
            divided_1 += leftAll;

            for (tick of Allticket) {
                if (dividedAll >= 10) {
                    let newTick = await TicketModel.findOneAndUpdate({ _id: tick._id },
                        {
                            $inc: { "roi": 10 }
                        }, { new: true })
                    ticketClaimed.push(tick._id)
                    console.log("ticketClaimed", ticketClaimed);
                    dividedAll -= 10
                    console.log(`add 10$ to roi for user, ${tick.userName}, val after is: ${newTick.roi}, ticket postision ${tick.postionInRound}`);
                } else {
                    console.log("divide all small than 10, break forloop", dividedAll);
                    break
                }
                ticketDevidedCount++
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
            console.log("allTicketNotDevide", allTicketNotDevide);


            for (tk of allTicketNotDevide) {
                if (!divideRandom4_6.length) break
                if (ticketClaimed.includes(tk._id)) continue
                let val = Number(divideRandom4_6.shift())
                let t = await TicketModel.findOneAndUpdate({
                    _id: tk._id,
                }, {
                    $inc: { "roi": val }
                }, { new: true });
                ticketClaimed.push(t._id)
                console.log("ticketClaimed", ticketClaimed);
                console.log(`divide random ${val} for user ${t.userName} and roi after is: ${t.roi}, tick postision ${t.postionInRound}`);
                ticketDevidedCount++
            }
            console.log("divideRandom4_6 left after divide: ", divideRandom4_6);

            //for 2% all devide ticket đin't claim
            let avg = divided_2 / (Allticket.length - ticketDevidedCount)
            console.log("total 2%", divided_2, "2% for all avg is: ", avg);
            for (tk of Allticket) {
                if (divided_2 <= 0) {
                    console.log("divided_2 out");
                    break;
                }
                if (avg > divided_2) avg = divided_2
                if (ticketClaimed.includes(tk._id)) continue
                let t = await TicketModel.findOneAndUpdate({
                    _id: tk._id,
                }, {
                    $inc: { "roi": avg }
                }, { new: true });

                console.log("2% for all for user", t.userName, "roi after:", t.roi, "ticket postision", t.postionInRound);
                divided_2 -= avg
            }

            //first ticket and lastest 2 ticket
            let winner_vals = divided_4 / 3;
            console.log("top 3 val", winner_vals);
            let last1 = 0, last2 = 0
            if (Allticket.length === 2) {
                last1 = 1
            } else if (Allticket.length === 3) {
                last1 = 1
                last2 = 2
            } else {
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
            var all_affilated_round = JSON.parse(JSON.stringify(Round.refLog))
            let sorted = []
            let usertop = {}
            all_affilated_round.forEach(item => { usertop[item.userRef] !== undefined ? usertop[item.userRef]++ : usertop[item.userRef] = 0 })
            for ([key, val] of Object.entries(usertop)) {
                sorted.push({ userRef: key, count: val })
            }
            sorted = sorted.sort((a, b) => a.count - b.count)
            sorted = sorted.reverse().slice(0, 20)
            console.log("top 20", sorted);

            var top20_val = divided_3 / sorted.length;
            for (let i = 0; i < sorted.length; i++) {
                await UserModel.findOneAndUpdate({ _id: sorted[i].userRef }, {
                    $inc: { "balance.available": top20_val },
                    $push: {
                        tranferHistory: {
                            side: "in",
                            total: top20_val,
                            from: "System",
                            to: sorted[i].userRef,
                            type: "reward20",
                            time: Date.now(),
                            note: `Reward top 20 with position: ${i + 1}`
                        }
                    }
                })
            }

            Allticket = await TicketModel.find({ roundId })
            Allticket.forEach(async (item) => {
                console.log("postision", item.postionInRound, "update balance for user", item.userName, "value roi", item.roi);
                let u = await UserModel.findOneAndUpdate({ _id: item.userId }, {
                    $inc: {
                        "balance.available": item.roi
                    }
                })
            })
            await RoundModel.findOneAndUpdate({ roundId }, { active: false });
        } catch (err) {
            console.log(err);
        }
    }
}