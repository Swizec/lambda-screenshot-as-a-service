const index = require('../index');
const config = require('./config');
const puppeteer = require('puppeteer');

const type = process.argv[2],
    targetUrl = process.argv[3];

(async () => {
    let url = null;

    if (type === "image") {
        url = await index.optimizeImage(targetUrl)
            .then((result) => console.log(result))
            .catch((err) => console.error(err));
    } else {
        const browser = await puppeteer.launch({
            headless: false,
            slowMo: process.env.SLOWMO_MS,
            dumpio: !!config.DEBUG,
            // use chrome installed by puppeteer
        });

        url = await index.takeScreenshot(browser, targetUrl)
            .then((result) => console.log(result))
            .catch((err) => console.error(err));

        await browser.close();
    }

    console.log(url)
})();