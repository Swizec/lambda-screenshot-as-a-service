// const setup = require("./starter-kit/setup");
const getChrome = require("./getChrome");
const puppeteer = require("puppeteer-core");

const { optimizeImage } = require("./optimizeImage");
const { screenshotCode } = require("./screenshotCode.js");
const { takeScreenshot } = require("./takeScreenshot.js");

exports.handler = async (event, context, callback) => {
    // // For keeping the browser launch
    context.callbackWaitsForEmptyEventLoop = false;
    const chrome = await getChrome();

    console.log("got chrome");
    console.log(chrome);

    const browser = await puppeteer.connect({
        browserWSEndpoint: chrome.endpoint
    });

    console.log("got browser");

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "access-control-allow-methods": "GET"
    };

    if (!event.queryStringParameters) {
        callback(null, {
            statusCode: 400,
            headers,
            body: "You need a url"
        });
    }

    const targetUrl = event.queryStringParameters.url;
    const code = event.queryStringParameters.code;
    const codeType = event.queryStringParameters.codeType;

    if (!targetUrl && !code) {
        callback(null, {
            statusCode: 400,
            headers,
            body: "You need something to do"
        });
    }

    try {
        let result = null;

        switch (event.queryStringParameters.type) {
            case "image":
                result = await optimizeImage(targetUrl);
                break;
            case "code":
                result = await screenshotCode(browser, code, codeType);
                break;
            default:
                result = await takeScreenshot(browser, targetUrl);
        }

        callback(null, {
            statusCode: 200,
            headers,
            body: result
        });
    } catch (e) {
        callback(e);
    }
};
