"use client"
import FormComponent from "../components/FormComponent";
import { getChannels } from "../utils/getchannel";
import { useState } from "react";
import { useEffect } from "react";

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
    <div className="text-align:center p-4">
      <h1 className="head-text mb-4">Channel Preview Testing</h1>

      <FormComponent channels={channels}/>

    </div>
  );
}
