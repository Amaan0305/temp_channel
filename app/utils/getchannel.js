"use server"
import fs from 'fs';

export const getChannels = () => {
  const channelsDir = "/Users/amaan.akhtar/Documents/frontend/channel-preview-testing/Channel-Preview-Testing/app/links";
  const channels = fs.readdirSync(channelsDir)
    .filter(file => file !== 'index.mjs') // Exclude index.mjs from the list
    .map(file => file.replace('.mjs', '')); // Remove .mjs extension

  return channels;
};