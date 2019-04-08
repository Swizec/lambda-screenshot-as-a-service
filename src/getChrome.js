const launchChrome = require("@serverless-chrome/lambda");
const request = require("superagent");

const getChrome = async () => {
    const chrome = await launchChrome();

    const response = await request
        .get(`${chrome.url}/json/version`)
        .set("Content-Type", "application/json");

    const endpoint = response.body.webSocketDebuggerUrl;

    return {
        endpoint,
        instance: chrome
    };
};

module.exports = getChrome;
