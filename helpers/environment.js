const enviornments = {};

enviornments.staging = {
    port: 3000,
    envName: "staging",
};

enviornments.production = {
    port: 5000,
    envName: "production",
};

const currentEnvironment =
    typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

const enviornmentToExport =
    typeof enviornments[currentEnvironment] === "object"
        ? enviornments[currentEnvironment]
        : enviornments.staging;

module.exports = enviornmentToExport;
