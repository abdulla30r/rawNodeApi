//dependencies
const data = require("../../lib/data");
const { hash, createRandomString } = require("../../helpers/utilities");
const { parseJSON } = require("./../../helpers/utilities");
const user  = require("../../routes");
const tokenHandler = require("./tokenHandler");
const { maxChecks } = require("./../../helpers/environment");

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.get = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === "string" &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        // lookup the check
        data.read("checks", id, (err, checkData) => {
            if (!err && checkData) {
                const checkObject = { ...parseJSON(checkData) };
                const token =
                    typeof requestProperties.headersObject.token === "string"
                        ? requestProperties.headersObject.token
                        : false;

                tokenHandler._token.verify(
                    token,
                    checkObject.userPhone,
                    (isTokenValid) => {
                        if (isTokenValid) {
                            callback(200, checkObject);
                        } else {
                            callback(403, {
                                error: "Authentication failure!",
                            });
                        }
                    }
                );
            } else {
                callback(404, {
                    error: "Check not found",
                });
            }
        });
    } else {
        callback(400, {
            error: "You have a problem in your request",
        });
    }
};

handler._check.post = (requestProperties, callback) => {
    //validate inputs
    let protocol =
        typeof requestProperties.body.protocol === "string" &&
        ["http", "https"].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    let url =
        typeof requestProperties.body.url === "string" &&
        requestProperties.body.protocol.trim().length > 0
            ? requestProperties.body.url
            : false;

    let method =
        typeof requestProperties.body.method === "string" &&
        ["GET", "PUT", "POST", "DELETE"].indexOf(
            requestProperties.body.method
        ) > -1
            ? requestProperties.body.method
            : false;

    let successCodes =
        typeof requestProperties.body.successCodes === "object" &&
        requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;

    let timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === "number" &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;

    if (protocol && successCodes && timeoutSeconds && method) {
        let token =
            typeof requestProperties.headersObject.token === "string"
                ? requestProperties.headersObject.token
                : false;

        data.read("token", token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                let userPhone = parseJSON(tokenData).phone;

                data.read("users", userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(
                            token,
                            userPhone,
                            (isTokenValid) => {
                                if (isTokenValid) {
                                    let userObject = parseJSON(userData);
                                    let userChecks =
                                        typeof userObject.checks === "object" &&
                                        userObject.checks instanceof Array
                                            ? userObject.checks
                                            : [];

                                    if (userChecks.length < maxChecks) {
                                        let checkId = createRandomString(20);
                                        let checkObject = {
                                            id: checkId,
                                            userPhone,
                                            protocol: protocol,
                                            url,
                                            method,
                                            successCodes,
                                            timeoutSeconds,
                                        };

                                        //save
                                        data.create(
                                            "checks",
                                            checkId,
                                            checkObject,
                                            (err3) => {
                                                if (!err3) {
                                                    userObject.checks =
                                                        userChecks;
                                                    userObject.checks.push(
                                                        checkId
                                                    );

                                                    //save
                                                    data.update(
                                                        "users",
                                                        userPhone,
                                                        userObject,
                                                        (err4) => {
                                                            if (!err4) {
                                                                callback(
                                                                    200,
                                                                    checkObject
                                                                );
                                                            } else {
                                                                callback(500, {
                                                                    error: "saving failed",
                                                                });
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    callback(500, {
                                                        error: "There was a problem in server side",
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        callback(401, {
                                            error: "User already reached max check limit",
                                        });
                                    }
                                } else {
                                    callback(403, {
                                        error: "Authentication Failure",
                                    });
                                }
                            }
                        );
                    } else {
                        callback(404, {
                            error: "User not found",
                        });
                    }
                });
            } else {
                callback(404, {
                    error: "Token not found",
                });
            }
        });
    } else {
        callback(400, {
            error: "You have a problem in your",
        });
    }
};

handler._check.put = (requestProperties, callback) => {
    const id =
        typeof requestProperties.body.id === "string" &&
        requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;

    // validate inputs
    const protocol =
        typeof requestProperties.body.protocol === "string" &&
        ["http", "https"].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === "string" &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const method =
        typeof requestProperties.body.method === "string" &&
        ["GET", "POST", "PUT", "DELETE"].indexOf(
            requestProperties.body.method
        ) > -1
            ? requestProperties.body.method
            : false;

    const successCodes =
        typeof requestProperties.body.successCodes === "object" &&
        requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;

    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === "number" &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;

    if (id) {
        if (protocol || url || timeoutSeconds || successCodes) {
            data.read("checks", id, (err1, checkData) => {
                if (!err1 && checkData) {
                    let checkObject = { ...parseJSON(checkData) };

                    const token =
                        typeof requestProperties.headersObject.token ===
                        "string"
                            ? requestProperties.headersObject.token
                            : false;

                    tokenHandler._token.verify(
                        token,
                        checkObject.userPhone,
                        (tokenIsValid) => {
                            if (tokenIsValid) {
                                if (protocol) {
                                    checkObject.protocol = protocol;
                                }
                                if (url) {
                                    checkObject.url = url;
                                }
                                if (method) {
                                    checkObject.method = method;
                                }
                                if (successCodes) {
                                    checkObject.successCodes = successCodes;
                                }
                                if (timeoutSeconds) {
                                    checkObject.timeoutSeconds = timeoutSeconds;
                                }

                                //store
                                data.update(
                                    "checks",
                                    id,
                                    checkObject,
                                    (err2) => {
                                        if (!err2) {
                                            callback(200, {
                                                message: "Updated Successfully",
                                            });
                                        } else {
                                            callback(500, {
                                                error: "There was a server side error!",
                                            });
                                        }
                                    }
                                );
                            } else {
                                callback(403, {
                                    error: "Authentication error!",
                                });
                            }
                        }
                    );
                } else {
                    callback(404, {
                        error: "check not found",
                    });
                }
            });
        } else {
            callback(400, {
                error: "User data input error",
            });
        }
    } else {
        callback(400, {
            error: "Bad Request",
        });
    }
};

handler._check.delete = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === "string" &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (id) {
        // lookup the check
        data.read("checks", id, (err1, checkData) => {
            if (!err1 && checkData) {
                const token =
                    typeof requestProperties.headersObject.token === "string"
                        ? requestProperties.headersObject.token
                        : false;

                tokenHandler._token.verify(
                    token,
                    parseJSON(checkData).userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            // delete the check data
                            data.delete("checks", id, (err2) => {
                                if (!err2) {
                                    data.read(
                                        "users",
                                        parseJSON(checkData).userPhone,
                                        (err3, userData) => {
                                            const userObject =
                                                parseJSON(userData);
                                            if (!err3 && userData) {
                                                const userChecks =
                                                    typeof userObject.checks ===
                                                        "object" &&
                                                    userObject.checks instanceof
                                                        Array
                                                        ? userObject.checks
                                                        : [];

                                                // remove the deleted check id from user's list of checks
                                                const checkPosition =
                                                    userChecks.indexOf(id);
                                                if (checkPosition > -1) {
                                                    userChecks.splice(
                                                        checkPosition,
                                                        1
                                                    );
                                                    // resave the user data
                                                    userObject.checks =
                                                        userChecks;
                                                    data.update(
                                                        "users",
                                                        userObject.phone,
                                                        userObject,
                                                        (err4) => {
                                                            if (!err4) {
                                                                callback(200);
                                                            } else {
                                                                callback(500, {
                                                                    error: "There was a server side problem!",
                                                                });
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    callback(500, {
                                                        error: "The check id that you are trying to remove is not found in user!",
                                                    });
                                                }
                                            } else {
                                                callback(500, {
                                                    error: "There was a server side problem!",
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    callback(500, {
                                        error: "There was a server side problem!",
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: "Authentication failure!",
                            });
                        }
                    }
                );
            } else {
                callback(500, {
                    error: "You have a problem in your request",
                });
            }
        });
    } else {
        callback(400, {
            error: "You have a problem in your request",
        });
    }
};
module.exports = handler;
