const aws = require('aws-sdk');
const fs = require('fs');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const gm = require('gm');

exports.uploadScreenshot = async function uploadScreenshot(path) {
    const screenshot = await imagemin([path], {
        plugins: [imageminJpegtran(), imageminPngquant({
            quality: '65-80'
        })]
    });

    return new Promise((resolve, reject) => {
            gm(screenshot[0].data).resize(480).toBuffer('png', async function (err, buffer) {
                if (err) reject(err);
                const s3 = new aws.S3({
                    apiVersion: '2006-03-01',
                });

                const {
                    Location
                } = await s3.upload({
                    Bucket: 'techletter.app',
                    Key: `screenshot-${new Date().getTime()}.png`,
                    Body: buffer,
                    ACL: 'public-read',
                }).promise();

                resolve(Location);
            })
        }

        // return Location;
    )
}