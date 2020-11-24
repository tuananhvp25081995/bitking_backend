const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: { type: String, unique: true },
    Code: { type: String },
    Email: { type: String, unique:true},
    Phone: { type: String, default: null },
    Password: { type: String, default: null },
    LastLogin: { type: Date, default: null },
    Location: { type: String, default: null },
    Status: { type: Boolean, },
    ReferralId: { type: String, default: null },

    mail: {
        email: { type: String, default: "", unique:true },
        verifyCode: { type: String, default: "" },
        isVerify: { type: Boolean, default: false }
    },


    currency: { type: String, default: "BKT" },
    balance: {
        available: { type: Number, default: 0 },
        locked: { type: Number, default: 0 }
    },
    status: {
        type: String, default: "available",
        enum: ["locked", "available"]
    },
    depositHistory: [{
        symbol: { type: String, default: "ETH" },
        fee: { type: Number, default: 0 },
        depositValue: { type: Number, default: 0 },
        depositAdr: { type: String, default: "ETH" },
        totalBKT: { type: Number, default: 0 },
        status: { type: String, default: "success", enum: ["fail", "success"] },
        time: { type: Date, default: Date.now() }
    }],
    withdrawal: [{
        symbol: { type: String, default: "BKT" },
        fee: { type: Number, default: 0 },
        withdrawalValue: { type: Number, default: 0 },
        txHash: { type: String, default: "0x" },
        id: { type: String, default: "withdrawalID" },
        status: { type: String, default: "Pending" },
        time: { type: Date, default: Date.now() }
    }],
    tranferHistory: [{
        side: { type: String, default: "out", enum: ["in", "out"] },
        symbol: { type: String, default: "BKT" },
        fee: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        from: { type: String, default: "admin" },
        to: { type: String, default: "admin" },
        time: { type: Date, default: Date.now() }
    }],
}, {
    timestamps: true,
    versionKey: false
})


mongoose.model("UserModel", UserSchema, "users");

