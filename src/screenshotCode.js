const Base64 = require("js-base64").Base64;
const { uploadScreenshot } = require("./uploadScreenshot");

exports.screenshotCode = async (
    browser,
    codeBase64,
    codeType = "javascript"
) => {
    const code = Base64.decode(codeBase64.replace(" ", "+"));
    const carbonName = `carbon-${new Date().getTime()}`;

    console.log("CODE", code);

    const page = await browser.newPage();

    console.log("BROWSER PAGE");

    await page.setViewport({
        width: 1366,
        height: 768,
        isMobile: true
    });

    console.log("SET VIEWPORT");

    const targetUrl = `https://carbon.now.sh/?bg=rgba(255,255,255,1)&t=dracula&l=${codeType}&ds=true&wc=true&wa=true&pv=48px&ph=32px&ln=false&code=${encodeURIComponent(
        code
    )}`;

    console.log("TargetURL", targetUrl);

    await page.goto(targetUrl, {
        waitUntil: ["domcontentloaded", "networkidle0"]
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    let element = await page.$(".export-container");

    const { x, y, width, height } = await element.boundingBox();

    const imagePath = `/tmp/${carbonName}.png`;

    console.error("Loaded target carbon");

    await page.screenshot({
        path: imagePath,
        clip: {
            x,
            y,
            width,
            height: height - 2
        }
    });

    console.error("Made screeshot", {
        x,
        y,
        width,
        height: height - 2
    });

    await browser.close();

    const url = await uploadScreenshot(`/tmp/${carbonName}.png`, false);

    return url;
};
