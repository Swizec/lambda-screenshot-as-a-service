const setup = require("./starter-kit/setup");

const uploadScreenshot = require("./uploadScreenshot").uploadScreenshot;

exports.handler = async (event, context, callback) => {
    // // For keeping the browser launch
    context.callbackWaitsForEmptyEventLoop = false;
    const browser = await setup.getBrowser();

    const targetUrl = event.queryStringParameters.url;

    if (!targetUrl) {
        callback(null, {
            statusCode: 400,
            body: "You need a url"
        });
    }

    try {
        const result = await exports.run(browser, targetUrl);

        callback(null, {
            statusCode: 200,
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

    const tweet = await page.$(".permalink-tweet-container");
    const {
        x,
        y,
        width,
        height
    } = await tweet.boundingBox();

    console.error("Loaded tweet");

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

    console.error("Got url")

    await page.close();

    return url;
};