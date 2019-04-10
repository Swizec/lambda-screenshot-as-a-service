const URL = require("url");
const { uploadScreenshot } = require("./uploadScreenshot");

exports.takeScreenshot = async (browser, targetUrl) => {
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
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

    const { x, y, width, height } = await element.boundingBox();

    const imagePath = `/tmp/screenshot-${new Date().getTime()}.png`;

    console.error("Loaded target element");

    await page.screenshot({
        path: imagePath,
        clip: {
            x: x + 2,
            y: y + 2,
            width: width - 2,
            height: height - 2
        }
    });

    console.error("Made screeshot");

    const url = await uploadScreenshot(imagePath);

    console.error("Got url", url);

    return url;
};
