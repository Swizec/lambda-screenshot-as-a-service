// const setup = require("./starter-kit/setup");
const getChrome = require("./getChrome");

const {takeScreenshot} = require("./takeScreenshot.js");

function response(statusCode, body) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "access-control-allow-methods": "GET",
    };

    return {
        statusCode,
        headers,
        body,
    };
}

exports.handler = async (event, context, callback) => {
    // // For keeping the browser launch
    context.callbackWaitsForEmptyEventLoop = false;
    const browser = await getChrome();

    console.log("got browser");

    if (!event.queryStringParameters) {
        return response(400, "You need a url");
    }

    const targetUrl = event.queryStringParameters.url;

    if (!targetUrl) {
        return response(400, "URL query parameter required");
    }

    try {

        const result = await takeScreenshot(browser, targetUrl);

        return response(200, result);
    } catch (e) {
        console.log(e)
        return response(500, e);
    }
};
