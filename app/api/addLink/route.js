// import { facebookUrl } from '@/app/links/facebook.mjs';
import * as links from '../../links/index.mjs';
import fs from 'fs';
import path from 'path';

// "../../../public/screenshots/reference/"
//takes baseline screenshot of new url added 
const takeScreenshot = async (url,channel,filename) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
  
    const screenshotDir = "../../../public/screenshots/reference";
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
  
    const screenshotPath = path.join(screenshotDir,`${channel}` ,filename);
    await page.screenshot({ path: screenshotPath });
    await browser.close();
  
    return screenshotPath;
};

const apiCall = async (channelUrls, channel, selector, directory)  => {
    const response = await fetch("http://localhost:4001/screenshot", {
        method: "POST",
        headers: { "Content-Type" : "application/json"},
        body: JSON.stringify({
            url: channelUrls[channelUrls.length-1],
            selector,
            name: `url_${channelUrls.length-1}`,
            directory,
            channel
        })
    })
}

// API route that accepts a URL, channel, and type

export const POST = async (req) => {
    try {
        // console.log(facebookUrl);
        const { url, channel, scenario } = await req.json();
        if (!url || !channel || !scenario) {
            throw new Error('URL, channel, and scenario are required');
        }

        const channelFilePath = `/Users/amaan.akhtar/Documents/frontend/channel-preview-testing/Channel-Preview-Testing/app/links/${channel}.mjs`;
        const channelArray = links[`${channel}Url`];
        
        // Check if the URL already exists
        const urlExists = channelArray.some(entry => entry.url === url);
        if (urlExists) {
            return new Response(JSON.stringify({ message: 'URL already exists' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
        // Create the new object
        const newObject = { url, scenario };

        // Add the new object to the channel array
        channelArray.push(newObject);
        let selector;
        switch(channel) {
            case "facebook": selector = "div[role=article]";
            break;

            default: selector="article"
        }
        await apiCall(url,channel, selector,"reference");

        const updatedContent = `export const ${channel}Url = ${JSON.stringify(channelArray, null, 2)};`;
        // console.log(updatedContent);
        fs.writeFileSync(channelFilePath, updatedContent, 'utf-8');
        return new Response(JSON.stringify({ message: 'URL added successfully', newObject }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
      
    } catch (error) {
        console.error('Error processing URL:', error);
        throw new Error('Error processing URL');
    }
};