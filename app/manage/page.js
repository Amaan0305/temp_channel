"use client"
import FormComponent from "../components/FormComponent";
import { getChannels } from "../utils/getchannel";
import { useState, useEffect } from "react";

export default function Home() {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const fetchChannels = async () => {
      const fetchedChannels = await getChannels();
      setChannels(fetchedChannels);
    };

    fetchChannels();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Channel Preview Testing</h1>
      <h2 className="text-xl mb-4">Add New Permalink</h2>

      <FormComponent channels={channels} />

      <div className="mt-8 text-sm text-gray-600">
        {/* Optional additional content or information */}
        {/* Example: */}
        {/* Lorem ipsum dolor sit amet, consectetur adipiscing elit. */}
      </div>
    </div>
  );
}
