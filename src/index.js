const setup = require("./starter-kit/setup");

const uploadScreenshot = require("./uploadScreenshot");

exports.handler = async (event, context, callback) => {
    // For keeping the browser launch
    context.callbackWaitsForEmptyEventLoop = false;
    const browser = await setup.getBrowser();
    try {
        const result = await exports.run(browser);
        callback(null, result);
    } catch (e) {
        callback(e);
    }
};

exports.run = async (browser) => {
    // implement here
    // this is sample
    const page = await browser.newPage();
    await page.setViewport({
        width: 1366,
        height: 768,
        isMobile: true
    });

    await page.goto("https://twitter.com/Swizec/status/1063932274528251904", {
        waitUntil: ["domcontentloaded", "networkidle0"]
    });

    const tweet = await page.$(".permalink-tweet-container");
    const {
        x,
        y,
        width,
        height
    } = await tweet.boundingBox();

    await page.screenshot({
        path: "/tmp/screenshot.png",
        clip: {
            x,
            y,
            width,
            height
        }
    });

    uploadScreenshot("/tmp/screenshot.png");

    await page.close();
    return "done";
};