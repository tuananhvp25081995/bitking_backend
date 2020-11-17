const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let schemaroundModel = new Schema(
    {
        roundId: { type: String, default: "1" , unique:true },
        roundStartTime: { type: Date, default: Date.now() },
        roundEndTime: { type: Date, default: Date.now() },
        totalTicket: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
        time: { type: Date, default: Date.now() },


        revenue: {
            //4% for company
            company: { type: Number, default: 0 },
            //2% for builder
            builder: { type: Number, default: 0 },
        },

        fund: {
            total44: { type: Number, default: 0 },
            develop:{type: Number, default: 0},
        },

        devide: {
            total: { type: Number, default: 0 },
            isDevided: { tpye: Boolean, default: false },

            refTotal: { type: Number, default: 0 },
            //for all
            total75: { type: Number, default: 0 },
            //10% for random 4-6$ left
            total10: { type: Number, default: 0 },

            //devide equal for all user left
            total8: { type: Number, default: 0 },

            //2% for top 1 and 2 lastest
            total2: { type: Number, default: 0 },

            //2% for top 20 users 
            total2for20: { type: Number, default: 0 },

            //for development
            total3: { type: Number, default: 0 }
        }
    },
    {
        timestamps: true,
        // versionKey: true
    }
);

mongoose.model("RoundModel", schemaroundModel, "roundGame");
