// const setup = require("./starter-kit/setup");
const getChrome = require("./getChrome");
const puppeteer = require("puppeteer-core");
const URL = require("url");
const download = require("image-downloader");
const Base64 = require("js-base64").Base64;

const uploadScreenshot = require("./uploadScreenshot").uploadScreenshot;

exports.handler = async (event, context, callback) => {
    // // For keeping the browser launch
    context.callbackWaitsForEmptyEventLoop = false;
    const chrome = await getChrome();

    console.log("got chrome");
    console.log(chrome);

    const browser = await puppeteer.connect({
        browserWSEndpoint: chrome.endpoint
    });

    console.log("got browser");

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "access-control-allow-methods": "GET"
    };

    if (!event.queryStringParameters) {
        callback(null, {
            statusCode: 400,
            headers,
            body: "You need a url"
        });
    }

    const targetUrl = event.queryStringParameters.url;
    const code = event.queryStringParameters.code;
    const codeType = event.queryStringParameters.codeType;

    if (!targetUrl && !code) {
        callback(null, {
            statusCode: 400,
            headers,
            body: "You need something to do"
        });
    }

    try {
        let result = null;

        switch (event.queryStringParameters.type) {
            case "image":
                result = await exports.optimizeImage(targetUrl);
                break;
            case "code":
                result = await exports.screenshotCode(browser, code, codeType);
                break;
            default:
                result = await exports.takeScreenshot(browser, targetUrl);
        }

        callback(null, {
            statusCode: 200,
            headers,
            body: result
        });
    } catch (e) {
        callback(e);
    }
};

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

exports.optimizeImage = async targetUrl => {
    const imagePath = `/tmp/screenshot-${new Date().getTime()}.png`;

    await download.image({
        url: targetUrl,
        dest: imagePath
    });

    const url = await uploadScreenshot(imagePath);

    return url;
};

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
