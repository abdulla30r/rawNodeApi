//dependencies
const data = require("./data");
const { parseJSON } = require("./../helpers/utilities");
const http = require("http");
const https = require("https");
const url = require("url");
const { check } = require("../routes");
const { sendTwilioSms } = require("./../helpers/notification");

// app object - module scaffolding
const worker = {};

//validateCheck data
worker.validateCheckData = (checkData) => {
    let originalData = checkData;
    if (originalData && originalData.id) {
        originalData.state =
            typeof originalData.state === "string" &&
            ["up", "down"].indexOf(originalData.state) > -1
                ? originalData.state
                : "down";

        originalData.lastChecked =
            typeof originalData.lastChecked === "number" &&
            originalData.lastChecked > 0
                ? originalData.lastChecked
                : false;

        worker.performCheck(originalData);
    } else {
        console.log("Error: Not properly formatted");
    }
};

//performCheck
worker.performCheck = (originalData) => {
    //prepare the initial check outcome
    let checkOutcome = {
        error: false,
        responseCode: false,
    };

    //mark the outcome has not been sent yet
    let outcomeSent = false;

    //parse the hostname & full url from original data
    const parsedUrl = url.parse(
        originalData.protocol + "://" + originalData.url,
        true
    );
    //const parsedUrl = new URL(originalData.protocol + "://" + originalData.url);
    const hostname = parsedUrl.hostname;
    const path = parsedUrl.path;

    const requestDetails = {
        protocol: `${originalData.protocol}:`,
        hostname: hostname,
        method: originalData.method.toUpperCase(),
        path,
        timeout: originalData.timeoutSeconds * 1000,
    };

    const protocolToUse = originalData.protocol === "http" ? http : https;

    let req = protocolToUse.request(requestDetails, (res) => {
        //grab the status of resposne
        const status = res.statusCode;

        //update the check outcome and pass the next process
        checkOutcome.responseCode = status;
        if (!outcomeSent) {
            worker.processCheckOutcome(originalData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on("error", (e) => {
        checkOutcome = {
            error: true,
            value: e,
        };
        if (!outcomeSent) {
            worker.processCheckOutcome(originalData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on("timeout", (e) => {
        checkOutcome = {
            error: true,
            value: "timeout",
        };
        if (!outcomeSent) {
            worker.processCheckOutcome(originalData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.end();
};

//lookup all the checks
worker.gatherAllChecks = () => {
    //get all the checks
    data.list("checks", (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach((check) => {
                data.read("checks", check, (err1, data) => {
                    if (!err1 && check && check.length > 0) {
                        const checkData = { ...parseJSON(data) };
                        worker.validateCheckData(checkData);
                    } else {
                        console.log("error reading data");
                    }
                });
            });
        } else {
            console.log("no file");
        }
    });
};

//save check outcome and send to next process
worker.processCheckOutcome = (originalData, checkOutcome) => {
    let state =
        !checkOutcome.error &&
        checkOutcome.responseCode &&
        originalData.successCodes.indexOf(checkOutcome.responseCode) > -1
            ? "up"
            : "down";

    let alertWanted =
        originalData.lastChecked && originalData.state !== state ? true : false;

    // //update the checkData
    let newCheckData = originalData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    //store data to file
    data.update("checks", newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log("Alert not needed");
            }
        } else {
            console.log("Error: Trying to save data of one of the check");
        }
    });
};

//alert user to status changed
worker.alertUserToStatusChange = (newCheckData) => {
    let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
        newCheckData.protocol
    }://${newCheckData.url} is currently ${newCheckData.state}`;
    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`user was alerted to a status change via sms: ${msg}`);
        } else {
            console.error("Message send failed");
        }
    });
};

/*
//timer to execute the worker process once per minute
worker.loop = ()=>{
    setInterval(()=>{
        worker.gatherAllChecks();
    },1000*60);
};
*/
//start the worker
worker.init = () => {
    //execute all the checks
    worker.gatherAllChecks();

    //call the loop so that checks continue
    //worker.loop();
};
module.exports = worker;
