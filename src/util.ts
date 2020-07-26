export function response(statusCode: number, body: any) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "access-control-allow-methods": "GET",
    };

    return {
        headers,
        statusCode,
        body: JSON.stringify(body),
    };
}
