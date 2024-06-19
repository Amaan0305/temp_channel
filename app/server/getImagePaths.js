import fs from 'fs';
import path from 'path';

const getImagePaths = (dirPath, basePath) => {
  const result = {};

  // Read existing imagePaths.json if it exists
  const jsonPath = path.join(dirPath, 'imagePaths.json');
  let existingData = {};
  if (fs.existsSync(jsonPath)) {
    try {
      existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    } catch (err) {
      console.error(`Error reading ${jsonPath}:`, err);
    }
  }

  // Process platforms and folders
  const platforms = fs.readdirSync(dirPath);
  platforms.forEach((platform) => {
    const platformPath = path.join(dirPath, platform);
    if (fs.statSync(platformPath).isDirectory()) {
      result[platform] = {};

      const folders = fs.readdirSync(platformPath);
      folders.forEach((folder) => {
        const folderPath = path.join(platformPath, folder);
        if (fs.statSync(folderPath).isDirectory()) {
          result[platform][folder] = fs.readdirSync(folderPath)
            .filter((file) => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
            .map((file) => path.join(basePath, platform, folder, file));
        }
      });
    }
  });

  // Write the updated result to imagePaths.json
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${jsonPath}:`, err);
  }

  return result;
};

export default getImagePaths;
