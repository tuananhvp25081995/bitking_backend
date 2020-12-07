const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    userId: { type: String, default: "" },
    Code: { type: String, default: null },
    roi: { type: Number, default: 0 },
    datePurchased: { type: Date, default: Date.now() },
    postionInRound: { type: Number, default: 500 },
    isDevided: { type: Boolean, default: false },
    roundId: { type: String, default: "0" },
    userName: { type: String }
}, {
    timestamps: true,
    versionKey: false
});

mongoose.model("ticketModel", TicketSchema, "usersTicket")
