import { APIGatewayEvent } from "aws-lambda";

import { uploadScreenshot } from "./uploadScreenshot";
import { getChrome } from "./getChrome";
import { APIResponse } from "./types";
import { response } from "./util";

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
    if (!event.queryStringParameters) {
        return response(400, {
            status: "error",
            error: "You need a title",
        });
    }

    const title = event.queryStringParameters.title;

    try {
        console.log("about to open browser");
        const browser = await getChrome();
        const imagePath = await cardScreenshot(browser, title);

        const url = await uploadScreenshot(imagePath);

        console.error("Got url", url);

        await browser.close();

        return response(200, {
            status: "success",
            url,
        });
    } catch (e) {
        console.log("erroring out of main try");
        console.log(e);
        return response(500, {
            status: "error",
            error: e,
        });
    }
}

async function cardScreenshot(browser: any, title: string) {
    const socialCardName = `socialCard-${new Date().getTime()}`;

    console.log("got socialCardname");

    const page = await browser.newPage();
    const targetUrl = `https://swizec.com/render-social-card?title=${title}`;

    console.log("TargetURL", targetUrl);

    await page.goto(targetUrl, {
        waitUntil: ["domcontentloaded", "networkidle0"],
    });

    let element = await page.$("#social-card");

    const { x, y, width, height } = await element.boundingBox();

    const imagePath = `/tmp/${socialCardName}.png`;

    console.log("Loaded target social card");
    console.log("dimensions", { x, y, width, height });

    await page.screenshot({
        path: imagePath,
        clip: {
            x,
            y,
            width,
            height,
        },
    });

    return imagePath;
}
