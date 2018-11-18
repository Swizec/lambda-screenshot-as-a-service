const aws = require("aws-sdk");
const gm = require("gm").subClass({
    imageMagick: true
});

exports.uploadScreenshot = async function uploadScreenshot(path) {
    return new Promise((resolve, reject) => {
        gm(path)
            .resize(480)
            .toBuffer("png", async function(err, buffer) {
                if (err) reject(err);
                const s3 = new aws.S3({
                    apiVersion: "2006-03-01"
                });

                const { Location } = await s3
                    .upload({
                        Bucket: "techletter.app",
                        Key: `screenshot-${new Date().getTime()}.png`,
                        Body: buffer,
                        ACL: "public-read"
                    })
                    .promise();

                resolve(Location);
            });
    });
};
