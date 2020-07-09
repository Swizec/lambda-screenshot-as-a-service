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

    // Todo, validation, sanitisation and adding a secret-ish token.
    const targetUrl = event.queryStringParameters.url;
    const s3FolderPath = event.queryStringParameters.env;
    const name = event.queryStringParameters.name;

    if (!targetUrl && !s3FolderPath && !name) {
        return response(400, "url, environment and name required");
    }

    try {
        const result = await takeScreenshot(browser, targetUrl, s3FolderPath, name);
        return response(200, result);
    } catch (e) {
        console.log(e)
        return response(500, e);
    }
};
