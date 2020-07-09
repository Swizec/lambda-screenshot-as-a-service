const aws = require("aws-sdk");
const fs = require("fs");
const mime = require('mime-types')
const requireEnv = require('require-env')

const S3_BUCKET_PATH = requireEnv.require('S3_BUCKET_PATH');

exports.uploadScreenshot = async function uploadScreenshot(path, s3FolderPath, name) {
    const s3 = new aws.S3();

    const filePath = `${s3FolderPath}/${name}.png`

    let params = {
        Bucket: S3_BUCKET_PATH,
        Key: filePath,
        ContentType: mime.lookup(path),
        Body: fs.readFileSync(path),
        ACL: 'public-read'
    };

    await s3.putObject(params).promise();

    return `s3://${S3_BUCKET_PATH}/${filePath}`;
};
