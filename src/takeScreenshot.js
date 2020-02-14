const URL = require("url");
const { uploadScreenshot } = require("./uploadScreenshot");
const fetch = require("isomorphic-fetch");

exports.takeScreenshot = async (browser, targetUrl) => {
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        isMobile: true
    });

    console.log("Requesting", targetUrl);

    await page.goto(targetUrl, {
        waitUntil: ["domcontentloaded", "networkidle2"]
    });

    console.log("page loaded");

    let element = null;

    switch (URL.parse(await page.url()).hostname) {
        case "twitter.com":
            const url = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
                targetUrl
            )}`;
            console.log("doing twitter with", url);
            const oembed = await fetch(url).then(res => res.json());

            console.log({ oembed });

            await page.setContent(oembed.html);
            element = await page.$("body");
            break;
        case "www.youtube.com":
            element = await page.$(".html5-video-player");
            break;
        case "www.instagram.com":
            element = await page.$("article");
            break;
        case "codesandbox.io":
            element = await page.$(".SplitPane");
            break;
    }

    console.log("found element", element);

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
