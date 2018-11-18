const aws = require('aws-sdk');
const fs = require('fs');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

exports.uploadScreenshot = async function uploadScreenshot(path) {
    const screenshot = await imagemin([path], {
        plugins: [imageminJpegtran(), imageminPngquant({
            quality: '65-80'
        })]
    })

    const s3 = new aws.S3({
        apiVersion: '2006-03-01',
    });

    const {
        Location
    } = await s3.upload({
        Bucket: 'techletter.app',
        Key: `screenshot-${new Date().getTime()}.png`,
        Body: screenshot[0].data,
        ACL: 'public-read',
    }).promise();


    return Location;
};