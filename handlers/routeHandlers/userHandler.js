//dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("./../../helpers/utilities");
const { user } = require("../../routes");
const tokenHandler = require("./tokenHandler");

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._user[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._user = {};

handler._user.get = (requestProperties, callback) => {
    //Validation

    const phone =
        typeof requestProperties.queryStringObject.phone === "string" &&
        requestProperties.queryStringObject.phone.length == 11
            ? requestProperties.queryStringObject.phone
            : false;

    if (phone) {
        //token verification
        let token =
            typeof requestProperties.headersObject.token === "string"
                ? requestProperties.headersObject.token
                : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                //lookup the user
                data.read("users", phone, (err, data) => {
                    if (!err && data) {
                        console.log(data);
                        const user = { ...parseJSON(data) };
                        delete user.password;
                        delete user.tosAgreement;
                        callback(200, user);
                    } else {
                        callback(404, {
                            error: "User not found",
                        });
                    }
                });
            } else {
                callback(403, { error: "Authentication failure" });
            }
        });
    } else {
        callback(400, { error: "Bad request" });
    }
};

handler._user.post = (requestProperties, callback) => {
    //Validation
    const firstName =
        typeof requestProperties.body.firstName === "string" &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === "string" &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

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

    const tosAgreement =
        typeof requestProperties.body.tosAgreement === "boolean" &&
        requestProperties.body.tosAgreement
            ? requestProperties.body.tosAgreement
            : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        //check if user exists
        data.read("users", phone, (err) => {
            if (err) {
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };

                //store to db
                data.create("users", phone, userObject, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: "user created successfully",
                        });
                    } else {
                        callback(500, {
                            error: "could not create user",
                        });
                    }
                });
            } else {
                callback(500, {
                    error: "user already exist",
                });
            }
        });
    } else {
        callback(400, {
            error: "Bad Request",
        });
    }
};

handler._user.put = (requestProperties, callback) => {
    //Validation
    const firstName =
        typeof requestProperties.body.firstName === "string" &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === "string" &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

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

    if (phone) {
        //token verify
        let token =
            typeof requestProperties.headersObject.token === "string"
                ? requestProperties.headersObject.token
                : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                //lookup
                data.read("users", phone, (err, userdata) => {
                    if (!err && userdata) {
                        if (firstName || lastName || password) {
                            const user = { ...parseJSON(userdata) };
                            if (firstName) {
                                user.firstName = firstName;
                            }
                            if (lastName) {
                                user.lastName = lastName;
                            }
                            if (password) {
                                user.password = hash(password);
                            }

                            data.update("users", phone, user, (err2) => {
                                if (!err2) {
                                    callback(200, {
                                        message:
                                            "User data updated successfully",
                                    });
                                } else {
                                    callback(err2);
                                }
                            });
                        }
                    } else {
                        callback(404, {
                            error: "user not found",
                        });
                    }
                });
            } else {
                callback(403, {
                    error: "Authentication Failure",
                });
            }
        });
    } else {
        callback(400, {
            error: "Bad Request",
        });
    }
};

handler._user.delete = (requestProperties, callback) => {
    //validation
    const phone =
        typeof requestProperties.queryStringObject.phone === "string" &&
        requestProperties.queryStringObject.phone.length == 11
            ? requestProperties.queryStringObject.phone
            : false;

    //token validation
    if (phone) {
        let token =
            typeof requestProperties.headersObject.token === "string"
                ? requestProperties.headersObject.token
                : false;

        //checking
        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                //lookup user
                data.read("users", phone, (err, userData) => {
                    if (!err && userData) {
                        //delet token
                        data.delete("token", token, (err2) => {
                            if (!err2) {
                                //delete user
                                data.delete("users", phone, (err) => {
                                    if (!err) {
                                        callback(200, {
                                            message:
                                                "User Deleted Successfully",
                                        });
                                    } else {
                                        callback(500, {
                                            error: "User Deletion Failed",
                                        });
                                    }
                                });
                            } else {
                                callback(500, {
                                    error: "token deletion failed",
                                });
                            }
                        });
                    } else {
                        callback(404, { error: "User not found" });
                    }
                });
            } else {
                callback(403, {
                    error: "Authentication Failure",
                });
            }
        });
    }
};

module.exports = handler;
