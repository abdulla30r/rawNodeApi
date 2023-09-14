// dependencies
const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");
const enviornments = require("./helpers/environment");
const data = require("./lib/data");

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

// start the server
app.createServer();
