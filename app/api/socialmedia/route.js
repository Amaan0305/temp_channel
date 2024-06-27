// pages/api/socialmedia.js

// Ensure correct import paths based on your project structure
import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';

export const POST = async (req) => {
  if (req.method === 'POST') {
    await connectToDatabase();
    
    try {
      const formData = await req.json();
      console.log(formData);
      const newSocialMedia = new SocialMedia(formData);
      await newSocialMedia.save();
      return new Response(JSON.stringify({ message: "Test complete" }), { status: 201 });
    } catch (error) {
      return new Response(JSON.stringify(error), { status: 500 });
    }
  } else {
    return new Response(JSON.stringify({ success: false, error: `Method ${req.method} Not Allowed` }), { status: 405 });
  }
};
