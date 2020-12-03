const mongoose = require("mongoose");
var md5 = require('md5');
const TicketService = require('../middle/TIcketService')
const UserModel = mongoose.model("UserModel");
const RoundModel = mongoose.model("RoundModel");

class CQueue {
    constructor() {
      this.data = [];
      this.size = 0;
      this.front = 0;
      this.rear = 0;
    }
  
    isEmpty() {
      return this.size === 0;
    }
  
    enqueue(item) {

      this.data[this.rear] = item;
      this.size++;
      return true;
    }
  
    dequeue() {
      if (this.isEmpty()) return undefined;
  
      let item = this.data[this.front];
      this.size--;
      return item;
    }
  
    front() {
      if (this.isEmpty()) return undefined;
  
      return this.data[0];
    }
  
    rear() {
      if (this.isEmpty()) return undefined;
  
      return this.data[this.size - 1];
    }

}

exports.Buy = async function (req, res) {
    const queue = new CQueue()
    var userId = req.body.userId;
    var ticket = req.body.ticket;
    
    let timeNow = Date.now()
    var checkRound = await RoundModel.findOne({
        $and: [{
            "roundStartTime": { $lte: timeNow }
        }, { "roundEndTime": { $gt: timeNow } }]
    });
    // console.log(checkRound);
    if (!checkRound) {
        console.log("null checkRound");
        return res.status(400).json({ error: "cannot found round id" })
    }
    let roundId = checkRound.roundId
    queue.enqueue({valTicket:ticket, userId, roundId})

    if (!userId) {
        res.status(400).json({ error: "Missing userId" })
    } else if (checkRound.active !== true) {
        res.status(400).json({ error: "You cannot buy ticket at this time" })
    }
    else if (!ticket) {
        res.status(400).json({ error: "Ticket must be not null" })
    }
    else if (ticket > 1) {
        res.status(400).json({ error: "Too fast" })
    }
    else if (!roundId) {
        res.status(400).json({ error: "Cannot found round id" })
    }
    else {
        try {
            let value = queue.dequeue()
            TicketService.UpdateTicket(value)
        } catch (err) {
            console.log("err in Updateticket", err);
            return res.status(400).json({ message: "something went wrong" })
        }

        res.status(200).json({ message: "OK" })
    }

}