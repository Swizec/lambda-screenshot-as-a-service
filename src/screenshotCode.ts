const Base64 = require("js-base64").Base64;

export async function screenshotCode(
    browser: any,
    code: string,
    codeType: string,
    urlencoded: boolean
) {
    const inputCode = urlencoded
        ? decodeURIComponent(code)
        : Base64.decode(code.replace(" ", "+"));

    console.log("CODE", inputCode);

    const carbonName = `carbon-${new Date().getTime()}`;
    const page = await browser.newPage();

    const targetUrl = `https://carbon.now.sh/?bg=rgba(255,255,255,1)&t=dracula&l=${codeType}&ds=true&wc=true&wa=true&pv=48px&ph=32px&ln=false&code=${encodeURIComponent(
        inputCode
    )}`;

    console.log("TargetURL", targetUrl);

    await page.goto(targetUrl, {
        waitUntil: ["domcontentloaded", "networkidle0"],
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.error("Loaded target carbon");

    let element = await page.$(".export-container");

    const { x, y, width, height } = await element.boundingBox();

    const imagePath = `/tmp/${carbonName}.png`;

    await page.screenshot({
        path: imagePath,
        clip: {
            x,
            y,
            width,
            height: height - 2,
        },
    });

    console.log("Made screeshot", {
        x,
        y,
        width,
        height: height - 2,
    });

    return imagePath;
}
