const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4000;

let browser;
let page;

const viewports = [
    { width: 430, height: 932 },   // Mobile
    { width: 1920, height: 1080 }  // Large Desktop
];


async function initializePuppeteer() {
  browser = await puppeteer.launch({ headless: true });
  page = await browser.newPage();
}


app.use(express.json());

app.post('/screenshot', async (req, res) => {
  const { url, selector, name, directory, channel } = req.body;

  if (!url || !selector) {
    return res.status(400).send('URL and selector are required');
  }

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });

    const screenshots = [];

    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.waitForSelector(selector, { timeout: 60000 });

      await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) {
          element.style.zIndex = 1000000;
        }
      }, selector);

      const element = await page.$(selector);

      if (element) {
        const screenshotPath = `./public/screenshots/${directory}/${channel}/${name}_${viewport.height}x${viewport.width}.png`;
        await element.screenshot({ path: screenshotPath });
        screenshots.push({ viewport: `${viewport.width}x${viewport.height}`, path: screenshotPath });
        } else {
        return res.status(404).send('Selector not found');
      }
    }

    res.status(200).send("The screenshots have been generated");
  } catch (error) {
    console.error(error);
    res.status(500).send('Error capturing screenshot');
  }
});

app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));

app.listen(port, async () => {
  await initializePuppeteer();
  console.log(`Server is running on http://localhost:${port}`);
});

process.on('exit', async () => {
  if (browser) {
    await browser.close();
  }
});