"use client";

import FormComponent from "../components/FormComponent";
import SocialMediaFormComponent from "../components/SocialMediaFormComponent";
import EditChannelSetupComponent from "../components/EditChannelSetup";
import Dropdown from "../components/Dropdown";
import { getChannels } from "../utils/getchannel";
import { useState, useEffect } from "react";

export default function Home() {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const fetchChannels = async () => {
      const fetchedChannels = await getChannels();
      console.log(fetchedChannels);
      setChannels(fetchedChannels);
    };

    fetchChannels();
  }, []);

  const handleSocialMediaSubmit = async (formData) => {
    try {
      const response = await fetch('/api/socialmedia/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        console.log('Form submitted successfully');
      } else {
        console.error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEditSocialMedia = async (formData) => {
    try {
      console.log(formData);
      const response = await fetch(`/api/socialmedia/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        console.log('Social media data updated successfully');
      } else {
        console.error('Error updating social media data');
      }
    } catch (error) {
      console.error('Error updating social media data:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Channel Preview Testing</h1>

      <Dropdown title="Add New Permalink">
        <FormComponent channels={channels} />
      </Dropdown>

      <Dropdown title="Add Social Media Channel">
        <SocialMediaFormComponent onSubmit={handleSocialMediaSubmit} />
      </Dropdown>

      <Dropdown title="Edit Channel Setup">
        <EditChannelSetupComponent channelNames={channels} onSubmit={handleEditSocialMedia} />
      </Dropdown>
    </div>
  );
}
