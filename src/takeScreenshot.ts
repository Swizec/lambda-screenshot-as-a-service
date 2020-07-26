const { uploadScreenshot } = require("./uploadScreenshot");

export async function takeScreenshot(
    browser: any,
    targetUrl: string
): Promise<string> {
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        isMobile: true,
        deviceScaleFactor: 2,
    });

    console.log("Requesting", targetUrl);

    await page.goto(targetUrl, {
        waitUntil: ["domcontentloaded", "networkidle2"],
    });

    console.log("page loaded");

    let element = null;

    switch (new URL(await page.url()).hostname) {
        case "twitter.com":
            await page.goto(
                `https://tweet-embedder.swizec.vercel.app?url=${targetUrl}`,
                {
                    waitUntil: ["domcontentloaded", "networkidle2"],
                }
            );

            element = await page.$("#tweet");
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
            height: height - 2,
        },
    });

    console.error("Made screeshot", imagePath);
    return imagePath;
}
