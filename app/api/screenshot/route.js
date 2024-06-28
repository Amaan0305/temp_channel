import ScreenshotReference from "@/app/lib/models/ScreenshotReference.mjs";
import ScreenshotTest from "@/app/lib/models/ScreenshotTest.mjs";
import cloudinary from '../lib/cloudinary.mjs';
import { PassThrough } from 'stream';
import connectToDatabase from "@/app/lib/mongodb.mjs";

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

export const POST = async (req, res) => {
    const { link, selector, name, directory, channel } = req.body;
  
    if (!link || !selector) {
      return res.status(400).send('URL and selector are required');
    }
    connectToDatabase();
    const url = link.url;
    const scenario = link.scenario;
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });
  
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 375, height: 812 }
      ];
  
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
  
          const screenshotData = {
            viewport: `${viewport.width}x${viewport.height}`,
            scenario,
            url: uploadResult.secure_url,
            channel
          };
  
          if (directory === 'reference') {
            const newScreenshot = new ScreenshotReference(screenshotData);
            await newScreenshot.save();
          } else {
            const newScreenshot = new ScreenshotTest(screenshotData);
            await newScreenshot.save();
          }
  
          screenshots.push(screenshotData);
        } else {
          return res.status(404).send('Selector not found');
        }
      }
  
      await browser.close();
      res.status(200).send({ message: "The screenshots have been generated", screenshots });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error capturing screenshot');
    }
  };