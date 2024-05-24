import { APIGatewayEvent } from "aws-lambda";

import { getChrome } from "./getChrome";
import { APIResponse } from "./types";
import { response } from "./util";
import { screenshotCode } from "./screenshotCode";
import { uploadScreenshot } from "./uploadScreenshot";

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
    if (!event.queryStringParameters) {
        return response(400, {
            status: "error",
            error: "You need a url",
        });
    }

    const code = event.queryStringParameters.code;
    const codeType = event.queryStringParameters.codeType || "javascript";
    const urlencoded = event.queryStringParameters.urlencoded === "true";

    if (!code) {
        return response(400, {
            status: "error",
            error: "You need a code snippet",
        });
    }

    try {
        const browser = await getChrome();
        const imagePath = await screenshotCode(
            browser,
            code,
            codeType,
            urlencoded
        );

        const url = await uploadScreenshot(imagePath);

        console.error("Got url", url);

        await browser.close();

        return response(200, {
            status: "success",
            url,
        });
    } catch (e) {
        return response(500, {
            status: "error",
            error: e,
        });
    }
}
