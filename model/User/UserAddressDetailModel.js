const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserAddressDetailSchema = new Schema({

    UserId: { type: String, default: null },
    Address: { type: String },
    Symbol: { type: String },
    PrivateKey: { type: String },
    PublicKey: { type: String },
    Contract: { type: String, default: null },
    ForwardAutoId: { type: String, default: null },
    Wif: { type: String, default: null },
}, {
    timestamps: true,
    versionKey: false
})


mongoose.model("UserAddressDetailModel", UserAddressDetailSchema, "userAddress")

