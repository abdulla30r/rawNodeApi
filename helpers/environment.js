const enviornments = {};

enviornments.staging = {
    port: 3000,
    envName: "staging",
    secretKey: "skhkajhkhgahgka",
    maxChecks: 5,
    twilio: {
        fromPhone: "+15179011936",
        accountSid: "AC538c38e6158b88e57ed4d861a81853b6",
        authToken: "099337694219ccae1e7871b9a6c355da",
    },
};

enviornments.production = {
    port: 5000,
    envName: "production",
    secretKey: "fjahjkghlajgaas",
    maxChecks: 5,
    twilio: {
        fromPhone: "+15179011936",
        accountSid: "AC538c38e6158b88e57ed4d861a81853b6",
        authToken: "099337694219ccae1e7871b9a6c355da",
    },
};

const currentEnvironment =
    typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

const enviornmentToExport =
    typeof enviornments[currentEnvironment] === "object"
        ? enviornments[currentEnvironment]
        : enviornments.staging;

module.exports = enviornmentToExport;
