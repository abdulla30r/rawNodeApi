// dependencies
const http = require("http");
const { handleReqRes } = require("./../helpers/handleReqRes");
const enviornments = require("./../helpers/environment");

// app object - module scaffolding
const server = {};

// create server
server.createServer = () => {
    const serverVariable = http.createServer(server.handleReqRes);
    serverVariable.listen(enviornments.port, () => {
        console.log(`listening to port ${enviornments.port}`);
    });
};

// handle Request Response
server.handleReqRes = handleReqRes;
server.init = () => {
    server.createServer();
};
module.exports = server;
