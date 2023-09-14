// dependencies
const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");
const enviornments = require("./helpers/environment");

// app object - module scaffolding
const app = {};

// configuration

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
