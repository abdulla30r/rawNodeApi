// dependencies
const server = require("./lib/server");
const worker = require("./lib/worker");

const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");
const enviornments = require("./helpers/environment");
const data = require("./lib/data");
const { sendTwilioSms } = require("./helpers/notification");

// app object - module scaffolding
const app = {};

/*
data.create(
    "test",
    "newFile",
    { name: "Bangladesh", language: "Bangla" },
    (err) => {
        console.log(`error was`, err);
    }
);
*/

/*
data.read("test", "newFile", (err,data) => {
    console.log(err,data);
});
*/

/*
data.update(
    "test",
    "newFile",
    { name: "Bangladesh", language: "Bangla" },
    (err) => {
        console.log(`error was`, err);
    }
);
*/

/*
data.delete("test", "newFile", (err, data) => {
    console.log(err, data);
});
*/

// //send twilio sms
// sendTwilioSms("01894604524", "hello", (err) => {
//     console.log(`this is the eror `, err);
// });

// start the server

app.init = () => {
    // start the server
    server.init();
    // start the workers
    worker.init();
};

app.init();

// export the app
module.exports = app;
