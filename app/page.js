"use client"

const generateScreenshots = async () => {
  try{
    const response = await fetch("/api/generateScreenshots", {
      method: "POST",
      headers: { "Content-Type" : "application/json"},
    })
    console.log(response);
  } catch (err) {
    console.log(err);
  }
}

const generateDifference = async () => {
  try{
    const response = await fetch("/api/generateDifference", {
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
      <h1>Difference Images</h1>

      <button onClick={(e) => {generateScreenshots()}}>Generate screenshots</button>

      <br/>

      <button onClick={(e) => {generateDifference()}}> Generate difference </button>

    </div>
  );
}
