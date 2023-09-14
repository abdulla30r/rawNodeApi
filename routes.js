// dependencies
const { aboutHandler } = require("./handlers/routeHandlers/aboutHandler");
const { sampleHandler } = require("./handlers/routeHandlers/sampleHandler");

const routes = {
    sample: sampleHandler,
    about: aboutHandler,
};

module.exports = routes;
