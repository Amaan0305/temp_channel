import captureScreenshots from "@/app/server/captureScreenshots.mjs";
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import getImagePaths from "@/app/server/getImagePaths";

// Function to read image files from a directory
async function readImageFiles(directory) {
  try {
    const files = await fs.promises.readdir(directory);
    return files.filter(file => path.extname(file).toLowerCase() === '.png');
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return [];
  }
}

// Function to compare two images and generate a diff image
async function compareImages(img1Path, img2Path, diffPath) {
  try {
    const img1Data = PNG.sync.read(await fs.promises.readFile(img1Path));
    const img2Data = PNG.sync.read(await fs.promises.readFile(img2Path));
    const { width, height } = img1Data;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(
      img1Data.data,
      img2Data.data,
      diff.data,
      width,
      height,
      { threshold: 0.3 }
    );

    if (numDiffPixels > 0) {
      const img1FileName = path.basename(img1Path);
      const img2FileName = path.basename(img2Path);
      const diffFileName = `${img1FileName}`;
      const diffDirName = path.basename(diffFileName, path.extname(diffFileName));
      const diffDirPath = path.join(diffPath, diffDirName);

      if (!fs.existsSync(diffDirPath)) {
        fs.mkdirSync(diffDirPath, { recursive: true });
      }

      const resultDiffPath = path.join(diffDirPath, diffFileName);
      const oldImgPath = path.join(diffDirPath, `old-${img1FileName}`);
      const newImgPath = path.join(diffDirPath, `new-${img2FileName}`);

      // console.log(`Difference image saved at: ${resultDiffPath}`);
      // console.log(`Old image saved at: ${oldImgPath}`);
      // console.log(`New image saved at: ${newImgPath}`);

      await fs.promises.writeFile(resultDiffPath, PNG.sync.write(diff));
      await fs.promises.copyFile(img1Path, oldImgPath);
      await fs.promises.copyFile(img2Path, newImgPath);
    }

    return numDiffPixels;
  } catch (error) {
    console.error(`Error comparing images ${img1Path} and ${img2Path}:`, error);
    return 0;
  }
}

// Function to compare images in two directories
async function compareDirectories(dir1, dir2, outputDir) {
  try {
    const files1 = await readImageFiles(dir1);
    const files2 = await readImageFiles(dir2);

    let totalDiffPixels = 0;

    for (let i = 0; i < Math.min(files1.length, files2.length); i++) {
      const img1Path = path.join(dir1, files1[i]);
      const img2Path = path.join(dir2, files2[i]);

      const diffPixels = await compareImages(img1Path, img2Path, outputDir);
      // console.log(`Compared: ${files1[i]} vs ${files2[i]}, Diff pixels: ${diffPixels}`);
      totalDiffPixels += diffPixels;
    }

    console.log(`Total difference pixels: ${totalDiffPixels}`);
    return totalDiffPixels;
  } catch (error) {
    console.error('Error comparing directories:', error);
    return 0;
  }
}


export const POST = async () => {
    try {
        await captureScreenshots("new");

        // Take screenshot of current state of urls
        console.log("Screenshots generated");


        // Compare the directories
        const channels = ["instagram", "linkedin", "twitter"];

        for (let channel of channels) {
            const directory1 = `public/screenshots/reference/${channel}`;
            const directory2 = `public/screenshots/new/${channel}`;
            const outputDirectory = `public/results/${channel}`;
        
            await compareDirectories(directory1, directory2, outputDirectory);
        }
        
        // Store the image paths in an object
        const publicDir = path.join(process.cwd(), 'public', 'results');
        const basePath = '/results';
        const imagePaths = getImagePaths(publicDir, basePath);
        
        return new Response (JSON.stringify("Test complete"), {status: 201})
    } catch (err) {
        return new Response(JSON.stringify(err), { status: 500 })
    }
}