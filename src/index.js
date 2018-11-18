const setup = require("./starter-kit/setup");
const URL = require('url');

const uploadScreenshot = require("./uploadScreenshot").uploadScreenshot;

exports.handler = async (event, context, callback) => {
    // // For keeping the browser launch
    context.callbackWaitsForEmptyEventLoop = false;
    const browser = await setup.getBrowser();

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

    if (!targetUrl) {
        callback(null, {
            statusCode: 400,
            headers,
            body: "You need a url"
        });
    }

    try {
        const result = await exports.run(browser, targetUrl);

        callback(null, {
            statusCode: 200,
            headers,
            body: result
        });
    } catch (e) {
        callback(e);
    }
};

exports.run = async (browser, targetUrl) => {
    // implement here
    // this is sample
    const page = await browser.newPage();
    await page.setViewport({
        width: 1366,
        height: 768,
        isMobile: true
    });

    await page.goto(targetUrl, {
        waitUntil: ["domcontentloaded", "networkidle0"]
    });

    let element = null;

    switch (URL.parse(await page.url()).hostname) {
        case "twitter.com":
            element = await page.$(".permalink-tweet-container");
            break;
        case "www.youtube.com":
            element = await page.$(".html5-video-player");
            break;
    }

    const {
        x,
        y,
        width,
        height
    } = await element.boundingBox();

    console.error("Loaded target element");

    await page.screenshot({
        path: "/tmp/screenshot.png",
        clip: {
            x,
            y,
            width,
            height
        }
    });

    console.error("Made screeshot");

    const url = await uploadScreenshot("/tmp/screenshot.png");

    console.error("Got url");

    await page.close();

    return url;
};