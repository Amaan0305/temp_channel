import React from 'react';

const fixed = async(channel, name) => {
  try {
    const response = await fetch("/api/fixed", {
      method: "POST",
      headers: { "Content-Type" : "application/json"},
      body: JSON.stringify({
        channel, name
      })
    })

  } catch (err) {
    console.log(err)
  }
}

const ImageGallery = ({ imagePaths }) => {
  return (
    <div>
      {Object.keys(imagePaths).map((platform, index) => (
        <div key={index} style={{ marginBottom: '20px' }}>
          <h2>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h2>
          {Object.keys(imagePaths[platform]).map((folder, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              <h3>
                {folder}
                <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded' onClick={(e) => {fixed()}}>Fixed</button>
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {imagePaths[platform][folder].map((imagePath, imgIdx) => (
                  <img
                    key={imgIdx}
                    src={imagePath}
                    alt={`${platform}/${folder}/${imgIdx}`}
                    style={{ marginRight: '10px', marginBottom: '10px', width: '250px', height: 'auto' }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
