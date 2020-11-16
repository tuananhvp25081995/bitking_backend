const mongoose = require('mongoose');

let mongoOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 1,
    useFindAndModify: false,

};
mongoose.connect(process.env.MONGO_URL, mongoOption)
    .then((a) => {
        console.log("DB has connectsss!");
        let database = mongoose.connection;

        database.on(
            "error",
            console.error.bind(console, "MongoDB connection error:")
        );

        database.on("connecting", () => {
            console.log("Error connecting db");
        });

        database.on("open", function () {
            console.log("Connected to mongo server.");
        });

        database.on("connecting", () => {
            console.log("Db connecting");
        });

        database.on("disconnected", () => {
            console.log("Db disconnected");
        });

        database.on("reconnectFailed", () => {
            console.log("Db reconnectFailed");
        });

        database.on("reconnected", () => {
            console.log("Db reconnected!");
        });
    })
    .catch((err) => {
        console.error(err);
    });