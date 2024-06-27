import express from 'express';
import puppeteer from 'puppeteer-extra';
import path from 'path';
import captureScreenshots from './captureScreenshots.mjs';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import cloudinary from '../lib/cloudinary.mjs';
import { PassThrough } from 'stream';
import fs from 'fs';
import connectToDatabase from '../lib/mongodb.mjs';
import SocialMedia from '../lib/models/channels.mjs';
import ScreenshotReference from '../lib/models/ScreenshotReference.mjs';
import ScreenshotTest from '../lib/models/ScreenshotTest.mjs';
import * as links from '../links/index.mjs';
import addSocialMediaChannel from './addChannel.mjs';

// import { data } from 'autoprefixer';

const app = express();
const port = 4001;

let browser;
let page;

const viewports = [
    { width: 1920, height: 1080 }  // Large Desktop
];

// Add stealth plugin and use it with puppeteer-extra
puppeteer.use(StealthPlugin());

async function initializePuppeteer() {
  browser = await puppeteer.launch({ headless: true });
  page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
  );
}

app.use(express.json());

async function facebookLoginByPass(page) {
  await page.evaluate(() => {
    const closeButton = document.querySelector('div[role=button][aria-label=Close]');
    if (closeButton) {
      closeButton.click();
    }
  });
  await page.waitForSelector('div[data-nosnippet]');
  await page.addStyleTag({
    content: `
      div[data-nosnippet], div[role=banner] {
        display: none !important;
      }
  `});
}

app.post('/screenshot', async (req, res) => {
  const { link  , selector, name, directory, channel } = req.body;

  if (!link || !selector) {
    return res.status(400).send('URL and selector are required');
  }
  const url = link.url;
  const scenario = link.scenario;
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });

    const screenshots = [];

    for (const viewport of viewports) {
      await page.setViewport(viewport);

      if (channel === "facebook") {
        await facebookLoginByPass(page);
      }
      await page.waitForSelector(selector, { timeout: 60000 });

      await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) {
          element.style.zIndex = 1000000;
        }
      }, selector);

      const element = await page.$(selector);

      if (element) {
        const screenshotBuffer = await element.screenshot({ encoding: 'binary' });
        const screenshotName = `${directory}/${channel}/${name}_${viewport.height}x${viewport.width}`;

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'image', public_id: screenshotName, overwrite: true },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          const bufferStream = new PassThrough();
          bufferStream.end(screenshotBuffer);
          bufferStream.pipe(stream);
        });
        
        console.log(screenshotName);
        const screenshotData = {
          viewport: `${viewport.width}x${viewport.height}`,
          scenario,
          url: uploadResult.secure_url,
          channel
        };
        if(directory==='reference'){
          const newScreenshot = new ScreenshotReference(screenshotData);
          await newScreenshot.save();
        }
        else{
          const newScreenshot = new ScreenshotTest(screenshotData);
          await newScreenshot.save();
        }
      } else {
        return res.status(404).send('Selector not found');
      }
    }

    // saveUrls(screenshots, directory, channel);

    res.status(200).send({ message: "The screenshots have been generated", screenshots });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error capturing screenshot');
  }
});

app.use('/screenshots', express.static(path.join(new URL(import.meta.url).pathname, 'screenshots')));

app.post('/add', async (req, res) => {
  try {
      const { channelName, divSelector , data , code } = req.body;
      console.log(channelName);
      // Validate request body
      if (!channelName || !data || !divSelector || !Array.isArray(data) || data.length === 0) {
          return res.status(400).json({ error: 'Invalid request body' });
      }
      // Check if channelName already exists
      const existingChannel = await SocialMedia.findOne({ channelName });
      if (existingChannel) {
          return res.status(400).json({ error: 'Channel already exists' });
      }
      // Create new instance of SocialMedia
      const socialMediaData = new SocialMedia({
          channelName,
          divSelector,
          data,
          code
      });

      // Save to database
      const savedData = await socialMediaData.save();

      res.status(201).json(savedData);
  } catch (error) {
      console.error('Error adding social media data:', error);
      res.status(500).json({ error: 'Failed to add social media data' });
  }
});

// Endpoint to save user-provided code for a channel
app.post('/save-code', async (req, res) => {
  const { channelName, code } = req.body;

  if (!channelName || !code) {
    return res.status(400).json({ message: 'Channel name and code are required' });
  }

  try {
    const channel = await SocialMedia.findOne({ channelName });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    channel.code = code;
    await channel.save();
    res.status(200).json({ message: 'Code saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving code', error });
  }
});

// Endpoint to fetch user-provided code for a channel
app.get('/fetch-code/:channelName', async (req, res) => {
  const { channelName } = req.params;

  try {
    const channel = await SocialMedia.findOne({ channelName });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.status(200).json({ code: channel.code });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching code', error });
  }
});

const startServer = async () => {
  try {
    await initializePuppeteer();
    await connectToDatabase();  // Connect to MongoDB

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    const channels = ["instagram", "facebook", "twitter"];
    let selector;

    for (let channel of channels) {

        switch(channel) {
            case "facebook": selector = "div[role=main]";
            break;

            default: selector="article"
        }

        const data = links[`${channel}Url`];
        let code = '';
        await addSocialMediaChannel(channel,selector,data,code);
    }

    // await captureScreenshots('reference');
    
    console.log("Reference Image generated");
  } catch (err) {
    console.error(err);
  }

};

startServer().catch(err => console.error(err));

process.on('exit', async () => {
  if (browser) {
    await browser.close();
  }
});
