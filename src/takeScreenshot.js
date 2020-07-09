const URL = require("url");
const { uploadScreenshot } = require("./uploadScreenshot");

exports.takeScreenshot = async (browser, targetUrl) => {
    const page = await browser.newPage();
    await page.setViewport({
        width: 800,
        height: 500,
        isMobile: true,
        deviceScaleFactor: 2,
    });

    console.log("Requesting", targetUrl);

    await page.goto(targetUrl, {
        waitUntil: ["domcontentloaded", "networkidle2"],
    });

    console.log("page loaded");

    const imagePath = `/tmp/screenshot-${new Date().getTime()}.png`;

    await page.screenshot({
        path: imagePath,
    });

    console.error("Made screeshot");

    const url = await uploadScreenshot(imagePath);

    console.error("Got url", url);

    return url;
};
