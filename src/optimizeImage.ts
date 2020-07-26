const download = require("image-downloader");

import { APIGatewayEvent } from "aws-lambda";
import { APIResponse } from "./types";
import { response } from "./util";
import { uploadScreenshot } from "./uploadScreenshot";

export async function optimizeImage(
    event: APIGatewayEvent
): Promise<APIResponse> {
    if (!event.queryStringParameters) {
        return response(400, {
            status: "error",
            error: "You need a url",
        });
    }

    const targetUrl = event.queryStringParameters.url;

    try {
        const imagePath = `/tmp/screenshot-${new Date().getTime()}.png`;
        await download.image({
            url: targetUrl,
            dest: imagePath,
        });

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
