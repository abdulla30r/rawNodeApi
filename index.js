// dependencies
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



// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(enviornments.port, () => {
        console.log(`listening to port ${enviornments.port}`);
    });
};

// handle Request Response
app.handleReqRes = handleReqRes;

//send twilio sms
sendTwilioSms("01894604524", "hello", (err) => {
    console.log(`this is the eror `, err);
});

// start the server
app.createServer();
