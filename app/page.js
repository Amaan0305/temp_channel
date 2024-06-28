"use client"

import ImageGallery from "./components/ImageGallery";
import { useEffect, useState } from "react";
import Loader from "./components/loader";
import Link from "next/link";


export default function Home() {
  const [loading, setLoading] = useState(false); 
  const [imagePaths, setImagePaths] = useState([]);
  useEffect(() => {
    const fetchImagePaths = async () => {
      try {
        const response = await fetch("/api/getImagePaths", {
          method: "GET",
          headers: { "Content-Type" : "application/json"},
        });
        const data = await response.json();
        
        setImagePaths(data);
      } catch (error) {
        console.error("Failed to fetch image paths:", error);
      }
    };

    fetchImagePaths();
  }, []);
  
  const runTest = async () => {
    try{
      setLoading(true)
      const response = await fetch("/api/runTest", {
        method: "POST",
        headers: { "Content-Type" : "application/json"},
      })
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="text-align:center">
      <h1 className="head-text">Channel Preview Testing</h1>

      {loading ? (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      ) : (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded"
          onClick={(e) => runTest()}
          disabled={loading} // Disable button when loading
        >
          Run Test
        </button>
      )}
      <Link href="./admin">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 m-2 rounded"
        >
          Go to Admin Page
        </button>
      </Link>
      {/* alert(imagePaths); */}
      <ImageGallery imagePaths={imagePaths}/>
    </div>
  );
}

