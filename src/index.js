const setup = require("./starter-kit/setup");
const URL = require("url");
const download = require("image-downloader");
const fs = require('fs');
const promisify = require('util').promisify;
const exec = require('child_process').exec;

const uploadScreenshot = require("./uploadScreenshot").uploadScreenshot;

exports.handler = async (event, context, callback) => {
    // // For keeping the browser launch
    context.callbackWaitsForEmptyEventLoop = false;
    const browser = await setup.getBrowser();

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
                result = await exports.screenshotCode(code, codeType);
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
        width: 1366,
        height: 768,
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

    const {
        x,
        y,
        width,
        height
    } = await element.boundingBox();

    const imagePath = `/tmp/screenshot-${new Date().getTime()}.png`;

    console.error("Loaded target element");

    await page.screenshot({
        path: imagePath,
        clip: {
            x,
            y,
            width,
            height
        }
    });

    console.error("Made screeshot");

    const url = await uploadScreenshot(imagePath);

    console.error("Got url");

    await page.close();

    return url;
};

exports.optimizeImage = async (targetUrl) => {
    const imagePath = `/tmp/screenshot-${new Date().getTime()}.png`;

    await download.image({
        url: targetUrl,
        dest: imagePath
    });

    const url = await uploadScreenshot(imagePath);

    return url;
};

exports.screenshotCode = async (codeBase64, codeType = 'js') => {
    const code = Buffer.from(codeBase64, "base64").toString();
    const writeFile = promisify(fs.writeFile);
    const codePath = `/tmp/code-${new Date().getTime()}.${codeType}`;
    const carbonName = `carbon-${new Date().getTime()}`;

    await writeFile(codePath, code);

    const {
        stdout
    } = await promisify(exec)(`node_modules/carbon-now-cli/cli.js ${codePath} -l /tmp -t ${carbonName}`);

    const url = await uploadScreenshot(`/tmp/${carbonName}.png`);

    return url
};