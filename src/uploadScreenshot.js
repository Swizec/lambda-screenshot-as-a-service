import aws from 'aws-sdk';
import fs from 'fs'
import {
    SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION
} from 'constants';

export default async function uploadScreenshot(path) {
    const screenshot = await new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) return reject(err);

            resolve(data);
        });
    });

    const s3 = new aws.S3({
        apiVersion: '2006-03-01'
    })
    const {
        Location
    } = await s3.upload({
        Bucket: 'techletter.app',
        Key: `screenshot-${new Date().getTime()}.png`,
        Body: screenshot,
        ACL: 'public-read'
    }).promise();

    console.log(Location);

    return Location;
}