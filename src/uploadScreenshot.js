const aws = require("aws-sdk");
const fs = require("fs");

const BUCKET = "techletter.app";

exports.uploadScreenshot = async function uploadScreenshot(path) {
    const s3 = new aws.S3({
        apiVersion: "2006-03-01",
    });

    const buffer = await new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });

    const { Location } = await s3
        .upload({
            Bucket: BUCKET,
            Key: `screenshot-${new Date().getTime()}.png`,
            Body: buffer,
            ACL: "public-read",
        })
        .promise();

    return Location;
};
