const download = require("image-downloader");
const { uploadScreenshot } = require("./uploadScreenshot");

exports.optimizeImage = async targetUrl => {
    const imagePath = `/tmp/screenshot-${new Date().getTime()}.png`;

    await download.image({
        url: targetUrl,
        dest: imagePath
    });

    const url = await uploadScreenshot(imagePath);

    return url;
};
