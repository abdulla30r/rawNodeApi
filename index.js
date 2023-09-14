//dependencies
const http = require("http");
const url = require("url");

//app object- Module scaffolding
const app = {};

//configuration
app.config = {
    port: 3000,
};

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(app.config.port, () => {
        console.log(`Listening to port ${app.config.port}`);
    });
};

//handle request response

app.handleReqRes = (req, res) => {
    //request handling
    //get the url and parse it
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");
    const method = req.method.toLowerCase();
    const queryStringObject = parsedUrl.query;

    //response handle
    res.end("Hello Programmers");
};

//start the server
app.createServer();
