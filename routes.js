// dependencies
const { aboutHandler } = require("./handlers/routeHandlers/aboutHandler");
const { checkHandler } = require("./handlers/routeHandlers/checkHandler");
const { sampleHandler } = require("./handlers/routeHandlers/sampleHandler");
const { tokenHandler } = require("./handlers/routeHandlers/tokenHandler");
const { userHandler } = require("./handlers/routeHandlers/userHandler");

const routes = {
    sample: sampleHandler,
    about: aboutHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler
};

module.exports = routes;
