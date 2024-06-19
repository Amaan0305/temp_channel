"use client"
import ImageGallery from "./components/ImageGallery";
import imagePaths from "../public/results/imagePaths.json";

const runTest = async () => {
  try{
    const response = await fetch("/api/runTest", {
      method: "POST",
      headers: { "Content-Type" : "application/json"},
    })
    console.log(response);
  } catch (err) {
    console.log(err);
  }
}

export default function Home() {
  return (
    <div>
      <h1 className="m-4">Channel Preview Testing</h1>

      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded" onClick={(e) => {runTest()}}> Run Test </button>

      <ImageGallery imagePaths={imagePaths}/>

    </div>
  );
}
