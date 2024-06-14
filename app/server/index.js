const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const { instagram, linkedin, twitter, facebook } = require('../links');

const captureScreenshots = async (channelUrls, channel, selector, directory)  => {
    for (let urlIndex = 0; urlIndex < channel.length; urlIndex++) {
        const response = await fetch("http://localhost:4000/screenshot", {
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

  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  
  return numDiffPixels;
}

// Function to compare images in two directories
function compareDirectories(dir1, dir2, outputDir) {
  const files1 = readImageFiles(dir1);
  const files2 = readImageFiles(dir2);

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  let totalDiffPixels = 0;

  for (let i = 0; i < Math.min(files1.length, files2.length); i++) {
    const img1Path = path.join(dir1, files1[i]);
    const img2Path = path.join(dir2, files2[i]);
    const diffPath = path.join(outputDir, `diff_${i}.png`);

    const diffPixels = compareImages(img1Path, img2Path, diffPath);
    console.log(`Compared: ${files1[i]} vs ${files2[i]}, Diff pixels: ${diffPixels}`);
    totalDiffPixels += diffPixels;
  }

  console.log(`Total difference pixels: ${totalDiffPixels}`);
}

async function main() {

  // ----- Works for Instagram, Linkedin ----- //
  await captureScreenshots(instagram, "instagram", "article", "screenshot1");
  await captureScreenshots(linkedin, "linkedin", "article", "screenshot1");

  // await captureScreenshots(twitter, "twitter", "article", "screenshot1");
  // --- TimeoutError: Waiting for selector `article` failed: Waiting failed: 60000ms exceeded
  
  // await captureScreenshots(facebook, "facebook", "article", "screenshot1");
  // --- Have to handle the login form

  
  // ---- Set Timeout (to be decided) ----- //

  await captureScreenshots(instagram, "instagram", "article", "screenshot2");
  await captureScreenshots(linkedin, "linkedin", "article", "screenshot2");
  await captureScreenshots(twitter, "twitter", "article", "screenshot2");
  // await captureScreenshots(facebook, "article", "screenshot1");
  

// ------------------ Comparison ----------------------- //

  // const directory1 = 'public/screenshots/screenshot1';
  // const directory2 = 'public/screenshots/screenshot2';
  // const outputDirectory = 'public/results';
  // compareDirectories(directory1, directory2, outputDirectory);

// --- If diff then update s1 directory
// --- No diff then continue

}

main().catch(err => console.error(err));