const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let schemaforwardHistory = new Schema(
    {
        UserId: { type: String, default: "" },
        currency: { type: String, default: "ETH" },
        type: { type: String, default: "PAYMENT_FORWARDING" },
        message: { type: String, default: "1" },
        ForwardAutoId: { type: String, default: "1" },
        txHash: { type: String, default: "1" },
        network: { type: String, default: "1" },
        status: { type: String, default: "1" },
        token: { type: String, default: "0x" },
        convert: {
            amountForward: { type: Number, default: 0 },
            feeForward: { type: Number, default: 0 },
            totalForward: { type: Number, default: 0 },
            feeDeposit: { type: Number, default: 0 },
            totalCoin: { type: Number, default: 0 },
            coinPrice: { type: Number, default: 0 },
            priceBKT: { type: Number, default: 10 },
            totalBKT: { type: Number, default: 0 },
            isConverted: { type: Boolean, default: false },
            time: { type: Date, default: Date.now() }
        }
    },
    {
        timestamps: true,
        // versionKey: true
    }
);

mongoose.model("ForwardHistoryModel", schemaforwardHistory, "forwardHistory");
