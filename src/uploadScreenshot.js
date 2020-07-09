const aws = require("aws-sdk");
const fs = require("fs");
const mime = require('mime-types')

const BUCKET = "public-for-testing123";

exports.uploadScreenshot = async function uploadScreenshot(path) {
    const s3 = new aws.S3({
        region: 'eu-west-1'
    });

    let params = {
        Bucket: BUCKET,
        Key: `screenshot-${new Date().getTime()}.png`,
        ContentType: mime.lookup(path),
        Body: fs.readFileSync(path),
        ACL: 'public-read'
    };

    const {Location} = await s3
        .putObject(params)
        .promise();

    return Location;
};
