const { uploadScreenshot } = require("./uploadScreenshot");

exports.takeScreenshot = async (browser, targetUrl, s3FolderPath, name) => {
    const page = await browser.newPage();
    await page.setViewport({
        width: 800,
        height: 500,
        isLandscape: true,
    });

    console.log("Requesting", targetUrl);

    await page.goto(targetUrl);

    await sleep(4000);

    console.log("page loaded");

    const imagePath = `/tmp/screenshot-${new Date().getTime()}.png`;

    await page.screenshot({
        path: imagePath,
    });

    await uploadScreenshot(imagePath, s3FolderPath, name);

    return 'Test';
};

function sleep(millis){
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve("hello"), millis)
    });
}
