const index = require('../index');
const config = require('./config');
const puppeteer = require('puppeteer');

const targetUrl = process.argv[2];

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: process.env.SLOWMO_MS,
        dumpio: !!config.DEBUG,
        // use chrome installed by puppeteer
    });
    const url = await index.run(browser, targetUrl)
        .then((result) => console.log(result))
        .catch((err) => console.error(err));

    console.log(url)

    await browser.close();
})();