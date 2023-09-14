// module scaffolding
const handler = {};

handler.aboutHandler = (requestProperties, callback) => {
    console.log(requestProperties);

    callback(300, {
        message: "This is a about url",
    });
};

module.exports = handler;
