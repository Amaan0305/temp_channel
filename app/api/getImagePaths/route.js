import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb.mjs';
import Result from '@/app/lib/models/resultSchema.mjs';
// Define the GET handler
export async function GET() {
  try {
    await connectToDatabase();

    const results = await Result.find({});
    // Initialize an empty object to store formatted results
    const formattedResults = {};

    // Transform data to get an object of image paths by platform
    results.forEach(result => {
        result.platforms.forEach(platform => {
          const platformName = platform.platformName;
          const images = platform.images.map(image => ({
            imageName: image.imageName,
            referenceUrl: image.referenceUrl,
            testUrl: image.testUrl,
            diffUrl: image.diffUrl
          }));
  
          // Only add platforms with images
          // if (images.length > 0) {
            formattedResults[platformName] = {};
  
            images.forEach((image) => {
              formattedResults[platformName][image.imageName] = [
                image.referenceUrl,
                image.testUrl,
                image.diffUrl
              ];
            });
          // }
        });
      });
   
    console.log(formattedResults);

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
