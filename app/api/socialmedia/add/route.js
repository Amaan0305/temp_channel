// pages/api/socialmedia.js

// Ensure correct import paths based on your project structure
import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';

export const POST = async (req) => {
  await connectToDatabase();

  try {
    const { channelName, divSelector, data, code } = await req.json();
    console.log(channelName);

    // Validate request body
    if (!channelName || !data || !divSelector || !Array.isArray(data) || data.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if channelName already exists
    const existingChannel = await SocialMedia.findOne({ channelName });
    if (existingChannel) {
      return new Response(JSON.stringify({ error: 'Channel already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create new instance of SocialMedia
    const socialMediaData = new SocialMedia({
      channelName,
      divSelector,
      data,
      code,
    });

    // Save to database
    const savedData = await socialMediaData.save();

    return new Response(JSON.stringify(savedData), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error adding social media data:', error);
    return new Response(JSON.stringify({ error: 'Failed to add social media data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
