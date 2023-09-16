const crypto = require("crypto");

const utilities = {};

const environments = require("./environment");

//Hashing String
utilities.hash = (str) => {
    if (typeof str === "string" && str.length > 0) {
        const hash = crypto
            .createHmac("sha256", "hello")
            .update(str)
            .digest("hex");

        return hash;
    } else {
        return false;
    }
};

//Parsing string to json
utilities.parseJSON = (jsonString) => {
    let output;

    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }

    return output;
};

//create random string
utilities.createRandomString = (strlength) => {
    let length = strlength;
    length = typeof strlength === "number" && strlength > 0 ? strlength : false;

    if (length) {
        const possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
        let output = "";
        for (let i = 1; i <= length; i++) {
            const randomCharacter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );
            output += randomCharacter;
        }
        return output;
    }

    return false;
};

module.exports = utilities;
