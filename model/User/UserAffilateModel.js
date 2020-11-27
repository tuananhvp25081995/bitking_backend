const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserAddressDetailSchema = new Schema({

    UserId: { type: String, default: null },
    from: { type: String },
    Symbol: { type: String, default:"BKT" },
    RoundId: { type: String },
    Value: { type: Number },
    UserNameRef:{ type: String },
    NameUser:{ type: String },


}, {
    timestamps: true,
    versionKey: false
})


mongoose.model("UserRef", UserAddressDetailSchema, "userRef")

