import fs from 'fs';
import path from 'path';
import getImagePaths from '@/app/server/getImagePaths';

export const POST = async ( req ) => {
    const { channel, name } = await req.json();

    console.log('Received channel:', channel);
    console.log('Received name:', name);

    try {
        const folderPath = path.join('public', 'results', channel, name);

        //Check if the folder exists
        if (fs.existsSync(folderPath)) {
            // Update the baseline
            const sourceImagePath = path.join('public', 'results', channel, name,`new-${name}.png`);
            const destinationImagePath = path.join('public', 'screenshots', 'reference', channel, `${name}.png`);
            fs.copyFileSync(sourceImagePath, destinationImagePath);
            console.log(`Copied and renamed image from ${sourceImagePath} to ${destinationImagePath}`);

            // Delete the folder recursively
            fs.rmdirSync(folderPath, { recursive: true });
            console.log(`Deleted folder: ${folderPath}`);

            // Store the image paths in an object
            const publicDir = path.join(process.cwd(), 'public', 'results');
            const basePath = '/results';
            const imagePaths = getImagePaths(publicDir, basePath);

            return new Response (JSON.stringify("Post removed"), {status: 201})
        } else {
            return new Response (JSON.stringify("Folder not found"), {status: 201})
        }

    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify(error), { status: 500 })
    }
};
