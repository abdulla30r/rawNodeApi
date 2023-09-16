//dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const { createRandomString } = require("../../helpers/utilities");
const { user } = require("../../routes");

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.get = (requestProperties, callback) => {
    //Validation
    // check the id if valid
    const id =
        typeof requestProperties.queryStringObject.id === "string" &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (id) {
        //lookup the token
        data.read("token", id, (err, tokenData) => {
            if (!err && tokenData) {
                const token = { ...parseJSON(tokenData) };
                callback(200, token);
            } else {
                callback(404, { error: "token not found" });
            }
        });
    } else {
        callback(400, { error: "bad request" });
    }
};

handler._token.post = (requestProperties, callback) => {
    //Validation
    const phone =
        typeof requestProperties.body.phone === "string" &&
        requestProperties.body.phone.trim().length == 11
            ? requestProperties.body.phone
            : false;

    const password =
        typeof requestProperties.body.password === "string" &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;

    if (phone && password) {
        let hashedPassword = hash(password);
        data.read("users", phone, (err1, userData) => {
            if (!err1 && userData) {
                const user = { ...parseJSON(userData) };
                //login successfull. create token
                if (hashedPassword === user.password) {
                    const tokenId = createRandomString(20);
                    const expires = Date.now() + 60 * 60 * 1000;
                    const tokenObject = {
                        phone,
                        id: tokenId,
                        expires,
                    };

                    //store the token

                    data.create("token", tokenId, tokenObject, (err2) => {
                        if (!err2) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, { error: "token generation failed" });
                        }
                    });
                } else {
                    callback(400, { error: "Password invalid" });
                }
            } else {
                callback(404, { error: "User not found" });
            }
        });
    } else {
        callback(400, {
            error: "You have a problem in your request",
        });
    }
};

handler._token.put = (requestProperties, callback) => {
    //Validation
    const id =
        typeof requestProperties.body.id === "string" &&
        requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;
    const extend =
        typeof requestProperties.body.extend === "boolean" &&
        requestProperties.body.extend === true
            ? true
            : false;
    if (id && extend) {
        data.read("token", id, (err, tokenData) => {
            if (!err && tokenData) {
                let token = { ...parseJSON(tokenData) };
                if (token.expires > Date.now()) {
                    token.expires = Date.now() + 60 * 60 * 1000;
                    data.update("token", id, token, (err2) => {
                        if (!err2) {
                            callback(200, {
                                message: "Token updated Succesfully",
                            });
                        } else {
                            callback(500, { error: "token update failed" });
                        }
                    });
                } else {
                    callback(400, { error: "token was already expired" });
                }
            } else {
                callback(404, { error: "Token  not found" });
            }
        });
    } else {
        callback(400, { error: "Bad request" });
    }
};

handler._token.delete = (requestProperties, callback) => {
    // check the token if valid
    const id =
        typeof requestProperties.queryStringObject.id === "string" &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (id) {
        // lookup the user
        data.read("token", id, (err1, tokenData) => {
            if (!err1 && tokenData) {
                data.delete("token", id, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: "Token was successfully deleted!",
                        });
                    } else {
                        callback(500, {
                            error: "There was a server side error!",
                        });
                    }
                });
            } else {
                callback(500, {
                    error: "There was a server side error!",
                });
            }
        });
    } else {
        callback(400, {
            error: "There was a problem in your request!",
        });
    }
};

handler._token.verify = (id, phone, callback) => {
    data.read("token", id, (err, tokenData) => {
        if (!err && tokenData) {
            const tokenObject = { ...parseJSON(tokenData) };
            if (
                tokenObject.phone === phone &&
                tokenObject.expires > Date.now()
            ) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handler;
