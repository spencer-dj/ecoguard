import React, { useEffect, useState } from 'react';
import './PoachingHistory.css';
import CacheBustedImage from './CacheBustedImage'; // Import the new component

const PoachingHistory = ({ fetchPoachingData }) => {
  const [detections, setDetections] = useState([]);
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPoachingData();
        setDetections(data.poaching_detections || []);
      } catch (error) {
        console.error('Failed to fetch poaching detections:', error);
        setError('Failed to load poaching detections.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [fetchPoachingData]);

  const openImage = (url) => {
    setImageUrl(url);
    setShowImage(true);
  };

  return (
    <div className="poaching-history-container">
      <h3>Last Poaching Detections</h3>

      {loading && <p>Loading detections...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && detections.length === 0 && (
        <p>No poaching detections recorded yet.</p>
      )}

      {!loading && !error && detections.length > 0 && (
        <table className="detections-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Species</th>
              <th>Zone</th>
              <th>Movement Prediction</th>
              <th>Image Class Prediction</th>
              <th>Probability</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {detections.map(({ id, timestamp, species, zone, xgb_prediction, image_class_prediction, pred_probability, image_url }) => (
              <tr key={id}>
                <td>{new Date(timestamp).toLocaleString()}</td>
                <td>{species}</td>
                <td>{zone}</td>
                <td>{xgb_prediction}</td>
                <td>{image_class_prediction || 'N/A'}</td>
                <td>{(pred_probability * 100).toFixed(2)}%</td>
                <td>
                  {image_url ? (
                    <button
                      className="view-image-button"
                      onClick={() => openImage(image_url)}
                    >
                      View Image
                    </button>
                  ) : (
                    'No Image'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setShowImage(false)}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Use CacheBustedImage instead of regular img */}
            <CacheBustedImage 
              src={`http://localhost:8000${imageUrl}`} 
              alt="Poacher Detection" 
            />
            <button
              className="image-modal-close-button"
              onClick={() => setShowImage(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoachingHistory;