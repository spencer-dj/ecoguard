import React, { useState, useEffect } from 'react';
import './Predictions.css';

const ImagePredictions = ({ 
  predictions, 
  imageUrl, 
  onIgnore, 
  onValidate,
  imageResultRaw 
}) => {
  const [showImage, setShowImage] = useState(false);

  // Close modal whenever a new image arrives
  useEffect(() => {
    setShowImage(false);
  }, [imageUrl]);

  return (
    <div className="predictions-box image-class-predictions">
      <h3>Image Classification</h3>

      <ul>
        {predictions.map((p) => (
          <li key={p.id}>{p.detail}</li>
        ))}
      </ul>

      {imageUrl && (
        <>
          <button 
            onClick={() => setShowImage(true)} 
            className="show-image-btn"
          >
            View Detected Image
          </button>

          {showImage && (
            <div 
              className="image-modal-overlay" 
              onClick={() => setShowImage(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                {/* Force React to reload by using key */}
                <img 
                  key={Date.now()} 
                  src={imageUrl} 
                  alt="Detected" 
                />
                <button onClick={() => setShowImage(false)}>Close</button>
              </div>
            </div>
          )}
        </>
      )}

      {predictions.length > 0 && (() => {
        const firstClass = predictions[0]?.class_name;
        if (['elephant', 'rhino'].includes(firstClass) && firstClass !== 'poacher') {
          return (
            <div className="prediction-actions">
              <button onClick={onIgnore} className="btn btn-ignore">Ignore</button>
              <button onClick={onValidate} className="btn btn-validate">Validate Poacher</button>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
};

export default ImagePredictions;
