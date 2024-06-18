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
    const channels = ["instagram", "facebook", "linkedin", "twitter"];
    let selector;

    for (let channel of channels) {

        switch(channel) {
            case "facebook": selector = "div[role=article]";
            break;

            default: selector="article"
        }

        const urls = links[`${channel}Url`];
        await apiCall(urls, channel, selector, directory);
    }
}

export default captureScreenshots;