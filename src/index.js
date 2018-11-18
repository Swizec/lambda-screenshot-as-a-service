const setup = require("./starter-kit/setup");

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
    await page.goto("https://www.google.com", {
        waitUntil: ["domcontentloaded", "networkidle0"]
    });

    await page.screenshot({
        path: 'google-screen.png'
    })

    await page.close();
    return "done";
};