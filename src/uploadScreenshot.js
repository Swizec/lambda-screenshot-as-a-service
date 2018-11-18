const aws = require("aws-sdk");
const gm = require("gm").subClass({
    imageMagick: true
});
const fs = require('fs');
const promisify = require('util').promisify;

exports.uploadScreenshot = async function uploadScreenshot(path, resize = true) {
    return new Promise((resolve, reject) => {
        const s3 = new aws.S3({
            apiVersion: "2006-03-01"
        });

        if (resize) {
            gm(path)
                .resize(480)
                .toBuffer("png", async function (err, buffer) {
                    if (err) reject(err);


                    const {
                        Location
                    } = await s3
                        .upload({
                            Bucket: "techletter.app",
                            Key: `screenshot-${new Date().getTime()}.png`,
                            Body: buffer,
                            ACL: "public-read"
                        })
                        .promise();

                    resolve(Location);
                });
        } else {
            (async function () {
                const buffer = await new Promise((resolve, reject) => {
                    fs.readFile(path, (err, data) => {
                        if (err) reject(err);
                        resolve(data);
                    });
                })

                const {
                    Location
                } = await s3
                    .upload({
                        Bucket: "techletter.app",
                        Key: `screenshot-${new Date().getTime()}.png`,
                        Body: buffer,
                        ACL: "public-read"
                    })
                    .promise();

                resolve(Location);
            })()
        }
    });
};