import { APIGatewayEvent } from "aws-lambda";

import { getChrome } from "./getChrome";
import { APIResponse } from "./types";
import { response } from "./util";
import { takeScreenshot } from "./takeScreenshot";
import { uploadScreenshot } from "./uploadScreenshot";

export async function handler(event: APIGatewayEvent): Promise<APIResponse> {
    if (!event.queryStringParameters) {
        return response(400, {
            status: "error",
            error: "You need a url",
        });
    }

    const targetUrl = event.queryStringParameters.url;

    try {
        const browser = await getChrome();
        const imagePath = await takeScreenshot(browser, targetUrl);

        const url = await uploadScreenshot(imagePath);

        console.error("Got url", url);

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
