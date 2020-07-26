export type APIResponse = {
    headers: { [key: string]: string | boolean | number };
    statusCode: number;
    body: string;
};
