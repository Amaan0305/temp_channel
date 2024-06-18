import * as links from '../links/index.mjs';

const apiCall = async (channelUrls, channel, selector, directory)  => {
    for (let urlIndex = 0; urlIndex < channel.length; urlIndex++) {
        const response = await fetch("http://localhost:4001/screenshot", {
            method: "POST",
            headers: { "Content-Type" : "application/json"},
            body: JSON.stringify({
                url: channelUrls[urlIndex],
                selector,
                name: `url_${urlIndex}`,
                directory,
                channel
            })
        })
    }
}

const captureScreenshots = async(directory) => {
    const channels = ["instagram", "linkedin", "twitter"];
    for (let channel of channels) {
        const urls = links[`${channel}Url`];
        await apiCall(urls, channel, "article", directory);
    }
}

export default captureScreenshots;