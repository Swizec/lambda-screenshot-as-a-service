import aws from "aws-sdk";
import fs from "fs";
import util from "util";

const BUCKET = "techletter.app";

export async function uploadScreenshot(path: string): Promise<string> {
    const s3 = new aws.S3({
        apiVersion: "2006-03-01",
    });

    // read file from path
    const readFile = util.promisify(fs.readFile);
    const buffer = await readFile(path);

    // upload to S3
    const { Location } = await s3
        .upload({
            Bucket: BUCKET,
            Key: `screenshot-${new Date().getTime()}.png`,
            Body: buffer,
            ACL: "public-read",
        })
        .promise();

    return Location;
}
