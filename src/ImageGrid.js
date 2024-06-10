import React from "react";
import { toPng } from "html-to-image";

const ImageGrid = ({ savedCovers }) => {
  const handleExportGrid = () => {
    const gridElement = document.getElementById("saved-covers-grid");
    toPng(gridElement)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "saved-covers-grid.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Failed to export grid to image", err);
      });
  };

  return (
    <div className="saved-covers-container">
      <h2>Saved Covers</h2>
      <div id="saved-covers-grid" className="saved-covers-grid">
        {savedCovers.map((cover, index) => (
          <div key={index} className="saved-cover">
            <img src={cover} alt={`Cover ${index}`} />
          </div>
        ))}
      </div>
      <button onClick={handleExportGrid}>Export Grid as Image</button>
    </div>
  );
};

export default ImageGrid;
