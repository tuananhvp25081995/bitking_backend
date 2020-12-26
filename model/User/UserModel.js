const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: { type: String },
    userId: { type: String, default: "userId" },
    contact: {
        phone: { type: String, default: null },
        phoneConfirmCode: { type: String, default: null },
    },
    LastLogin: { type: Date, default: null },
    Location: { type: String, default: null },
    ReferralId: { type: String, default: null },
    mail: {
        email: { type: String, default: "" },
        verifyCode: { type: String, default: "" },
        isVerify: { type: Boolean, default: false }
    },

    password: {
        password: { type: String, default: null },
        resetCode: { type: String, default: null },
        type: { type: String, default: null },
        salt: { type: String, default: null }
    },

    currency: { type: String, default: "BKT" },
    balance: {
        available: { type: Number, default: 0 },
        locked: { type: Number, default: 0 },

        //for cal
        ETH: {
            value: { type: Number, default: 0 }
        },
        BTC: {
            value: { type: Number, default: 0 }
        },
        USDTETH: {
            value: { type: Number, default: 0 }
        },
        USDTTRON: {
            value: { type: Number, default: 0 }
        },
        TRX: {
            value: { type: Number, default: 0 }
        },
        BKT: {
            value: { type: Number, default: 0 }
        }
    },

    //account status for manager
    status: {
        type: String, default: "available",
        enum: ["locked", "available"]
    },

    address: [{
        address: { type: String, default: "0x" },
        symbol: { type: String, default: "USDT" },
        privateKey: { type: String, default: "" },
        publicKey: { type: String, default: "" },
        contract: { type: String, default: "" },
        webhookId: { type: String, default: "" },
        url: { type: String, default: "" },
        wif: { type: String, default: "" },
        confirmations: { type: Number, default: 5 },
        created: { type: Date, default: Date.now() },
        active: { type: Boolean, default: true }
    }],


    depositHistory: [{
        symbol: { type: String, default: "ETH" },
        //fee tranfer in BKT
        fee: { type: Number, default: 0 },
        //value deposit after fee
        depositValue: { type: Number, default: 0 },
        depositAdr: { type: String, default: "0x" },
        totalBKT: { type: Number, default: 0 },
        coinPrice: { type: Number, default: 0 },
        status: { type: String, default: "success", enum: ["fail", "success"] },
        time: { type: Date, default: Date.now() },
        txid: { type: String, default: "" },
        txHash: { type: String, default: "" },
    }],
    withdrawal: [{
        symbol: { type: String, default: "BKT" },
        fee: { type: Number, default: 0 },
        withdrawalValue: { type: Number, default: 0 },
        txHash: { type: String, default: "0x" },
        address: { type: String, default: "" },
        id: { type: String, default: "withdrawalID" },
        //userPending: waiting user confirm email, pending: sending withdrawl, adminPending: waiting admin apruve
        status: { type: String, default: "userPending", enum: ["done", "userPending", "pending", "adminPending", "cancelled"] },
        userConfirmCode: { type: String, default: "" },
        isUserConfirm: { type: Boolean, default: false },
        isAdminConfirm: { type: Boolean, default: false },
        time: { type: Date, default: Date.now() }
    }],

    //for: user-user tranfer, ref revenue claim, reward claim
    tranferHistory: [{
        side: { type: String, default: "out", enum: ["in", "out"] },
        symbol: { type: String, default: "USD" },
        fee: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        from: { type: String, default: "admin" },
        to: { type: String, default: "admin" },
        time: { type: Date, default: Date.now() },
        type: { type: String, default: "normal", enum: ["normal", "ref", "reward3", "reward20", "buyBKT", "marketsuport", "agency"] },
        note: { type: String, default: "" }
    }],

    agencyLog: [{
        packageValue: { type: Number, default: 100 },
        time: { type: Date, default: Date.now() },
    }]
}, {
    timestamps: true,
    versionKey: false
})


mongoose.model("UserModel", UserSchema, "users");

