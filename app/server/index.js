const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const { instagramUrl, linkedinUrl, twitterUrl, facebookUrl } = require('../links/index.mjs');

const captureScreenshots = async (channelUrls, channel, selector, directory)  => {
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

// Function to read all image files from a directory
function readImageFiles(directory) {
  return fs.readdirSync(directory).filter(file => {
    return path.extname(file).toLowerCase() === '.png';
  });
}

// Function to compare two images and generate a diff image
function compareImages(img1Path, img2Path, diffPath) {
  const img1Data = PNG.sync.read(fs.readFileSync(img1Path));
  const img2Data = PNG.sync.read(fs.readFileSync(img2Path));
  const { width, height } = img1Data;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    img1Data.data,
    img2Data.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  if(numDiffPixels > 0) {
    const img1FileName = path.basename(img1Path);
    const img2FileName = path.basename(img2Path);
    const diffFileName = `diff-${img1FileName}`;
    const diffDirName = path.basename(diffFileName, path.extname(diffFileName));
    const diffDirPath = path.join(diffPath, diffDirName);

    if (!fs.existsSync(diffDirPath)) {
      fs.mkdirSync(diffDirPath, { recursive: true });
    }

    const resultDiffPath = path.join(diffDirPath, diffFileName);
    const oldImgPath = path.join(diffDirPath, `old-${img1FileName}`);
    const newImgPath = path.join(diffDirPath, `new-${img2FileName}`);

    console.log(`Difference image saved at: ${resultDiffPath}`);
    console.log(`Old image saved at: ${oldImgPath}`);
    console.log(`New image saved at: ${newImgPath}`);

    fs.writeFileSync(resultDiffPath, PNG.sync.write(diff));
    fs.copyFileSync(img1Path, oldImgPath);
    fs.copyFileSync(img2Path, newImgPath);
  }
  return numDiffPixels;
}

// Function to compare images in two directories
function compareDirectories(dir1, dir2, outputDir) {
  const files1 = readImageFiles(dir1);
  const files2 = readImageFiles(dir2);

  let totalDiffPixels = 0;

  for (let i = 0; i < Math.min(files1.length, files2.length); i++) {
    const img1Path = path.join(dir1, files1[i]);
    const img2Path = path.join(dir2, files2[i]);

    const diffPixels = compareImages(img1Path, img2Path, outputDir);
    console.log(`Compared: ${files1[i]} vs ${files2[i]}, Diff pixels: ${diffPixels}`);
    totalDiffPixels += diffPixels;
  }

  console.log(`Total difference pixels: ${totalDiffPixels}`);
}


async function main() {
  const channels = ["instagram", "linkedin", "twitter"];
  
  for (let channel of channels) {
    const urls = eval(`${channel}Url`);
    await captureScreenshots(urls, channel, "article", "screenshot1");
  }

  for (let channel of channels) {
    const urls = eval(`${channel}Url`);
    await captureScreenshots(urls, channel, "article", "screenshot2");
  }

  for (let channel of channels) {
    const directory1 = `public/screenshots/screenshot1/${channel}`;
    const directory2 = `public/screenshots/screenshot2/${channel}`;
    const outputDirectory = `public/results/${channel}`;

    compareDirectories(directory1, directory2, outputDirectory);
  }

// --- If diff then update s1 directory
// --- No diff then continue

}

main().catch(err => console.error(err));