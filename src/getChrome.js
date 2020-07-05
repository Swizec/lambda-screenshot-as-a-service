const chrome = require("chrome-aws-lambda");

const getChrome = async () => {
    let browser = null;

    try {
        browser = await chrome.puppeteer.launch({
            args: chrome.args,
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
            ignoreHTTPSErrors: true,
        });
    } catch (err) {
        console.log("ERROR LAUNCHING CHROME");
        console.error(err);
        throw err;
    }

    return browser;
};

module.exports = getChrome;
