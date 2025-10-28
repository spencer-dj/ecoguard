import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import './Dashboard.css';
import PoachingHistory from '../components/PoachingHistory';
import CacheBustedImage from '../components/CacheBustedImage'; // Import the new component
import { mapview, getImageResults, getXgbResults, validatePoacher, getLastPoachingDetections } from '../endpoint/api.js';
import 'leaflet.awesome-markers';

// FontAwesome icon component
const Icon = ({ glyph }) => <i className={`fa fa-${glyph}`} />;

// Leaflet markers for elephants and rhinos
const elephantIcon = L.AwesomeMarkers.icon({ icon: 'paw', prefix: 'fa', markerColor: 'blue' });
const rhinoIcon = L.AwesomeMarkers.icon({ icon: 'paw', prefix: 'fa', markerColor: 'red' });

const mapCenter = [-21.8584729, 31.6473187];

const Dashboard = () => {
  const [xgbPredictions, setXgbPredictions] = useState([]);
  const [imageClassPredictions, setImageClassPredictions] = useState([{ id: 0, detail: 'Awaiting image classification...', confidence: null }]);
  const [elephantLocations, setElephantLocations] = useState([]);
  const [rhinoLocations, setRhinoLocations] = useState([]);
  const [imageBaseUrl, setImageBaseUrl] = useState(''); // Store base URL without cache busting
  const [showImage, setShowImage] = useState(false);
  const [imageResultRaw, setImageResultRaw] = useState(null);

  // Fetch animal locations for the map
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const mapData = await mapview();
        setElephantLocations(mapData.elephants || []);
        setRhinoLocations(mapData.rhinos || []);
      } catch (err) {
        console.error("Error fetching map data:", err);
      }
    };

    fetchMapData();
    const interval = setInterval(fetchMapData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch XGBoost and image classification results
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const xgbResponse = await getXgbResults();
        const xgbResults = xgbResponse.xgb_results || [];

        if (xgbResults.length === 0) {
          setXgbPredictions([]);
        } else {
          const poacherPreds = xgbResults.filter(p => p.prediction === 'poacher');

          if (poacherPreds.length > 0) {
            setXgbPredictions(poacherPreds.map(p => ({
              id: p.id,
              prediction: p.prediction,
              species: p.species,
              latitude: p.latitude.toFixed(6),
              longtitude: p.longtitude.toFixed(6),
              timestamp: p.timestamp,
            })));
          } else {
            const speciesSet = new Set(xgbResults.map(p => p.species));
            const summary = Array.from(speciesSet).map((species, idx) => ({
              id: idx,
              prediction: 'normal',
              species,
              latitude: '',
              longtitude: '',
              timestamp: '',
            }));
            setXgbPredictions(summary);
          }
        }

        // Image classification
        const imageResponse = await getImageResults();
        const imageResults = imageResponse.image_results || [];

        if (imageResults.length === 0) {
          setImageClassPredictions([{ id: 0, detail: 'Awaiting image classification...', confidence: null }]);
          setImageBaseUrl('');
          setShowImage(false);
          setImageResultRaw(null);
        } else {
          setImageClassPredictions(imageResults.map((p, index) => ({
            id: index,
            detail: `${p.class_name.toUpperCase()} — ${(p.probability * 100).toFixed(1)}%`,
            class_name: p.class_name.toLowerCase(),
            confidence: p.probability,
          })));
          setImageResultRaw(imageResults[0]);
          if (imageResults[0].image_url) {
            // Store the base URL without cache busting parameters
            setImageBaseUrl(`http://localhost:8000${imageResults[0].image_url}`);
          }
        }
      } catch (error) {
        console.error('Polling failed:', error);
      }
    };

    fetchPredictions();
    const intervalId = setInterval(fetchPredictions, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Button handlers
  const handleIgnore = () => alert("Ignored.");
  const handleValidate = async () => {
    if (!imageResultRaw || !imageResultRaw.image_url) return;
    try {
      await validatePoacher({ image_url: imageResultRaw.image_url });
      alert("Image validated as poacher.");
    } catch (error) {
      console.error("Validation error:", error);
      alert("Failed to validate.");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="top-container">
        {/* Map */}
        <div className="map-container" style={{ height: '400px', width: '100%' }}>
          <MapContainer center={mapCenter} zoom={11} minZoom={9} maxZoom={15} scrollWheelZoom dragging style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {elephantLocations.map(loc => (
              <Marker key={`elephant-${loc.id}`} position={[loc.latitude, loc.longitude]} icon={elephantIcon}>
                <Popup>Elephant ID: {loc.id}<br />Coords: ({loc.latitude}, {loc.longitude})</Popup>
              </Marker>
            ))}

            {rhinoLocations.map(loc => (
              <Marker key={`rhino-${loc.id}`} position={[loc.latitude, loc.longitude]} icon={rhinoIcon}>
                <Popup>Rhino ID: {loc.id}<br />Coords: ({loc.latitude}, {loc.longitude})</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Predictions */}
        <div className="side-boxes">
          <div className="predictions-box xgb-predictions">
            <h3>XGBoost Predictions</h3>
            <ul>
              {xgbPredictions.length > 0 ? xgbPredictions.map(p => (
                <li key={p.id}>
                  {p.prediction.toUpperCase()} — {p.species}
                  {p.latitude && p.longtitude ? ` @ (${p.latitude}, ${p.longtitude})` : ''}
                </li>
              )) : <li>No predictions yet...</li>}
            </ul>
          </div>

          <div className="predictions-box image-class-predictions">
            <h3>Image Classification</h3>
            <ul>{imageClassPredictions.map(p => <li key={p.id}>{p.detail}</li>)}</ul>

            {imageBaseUrl && <>
              <button onClick={() => setShowImage(true)} className="show-image-btn">View Detected Image</button>
              {showImage && (
                <div className="image-modal-overlay" onClick={() => setShowImage(false)}>
                  <div onClick={e => e.stopPropagation()}>
                    {/* Use CacheBustedImage component instead of regular img */}
                    <CacheBustedImage 
                      src={imageBaseUrl} 
                      alt="Poacher Detected" 
                    />
                    <button onClick={() => setShowImage(false)}>Close</button>
                  </div>
                </div>
              )}
            </>}

            {imageClassPredictions.length > 0 && (() => {
              const firstClass = imageClassPredictions[0].class_name;
              const isElephantOrRhino = firstClass === 'elephant' || firstClass === 'rhino';
              const isPoacher = firstClass === 'poacher';
              if (isElephantOrRhino && !isPoacher) {
                return (
                  <div style={{ marginTop: '15px' }}>
                    <button onClick={handleIgnore} className="btn btn-ignore">Ignore</button>
                    <button onClick={handleValidate} className="btn btn-validate">Validate Poacher</button>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>

      <PoachingHistory fetchPoachingData={getLastPoachingDetections} />
    </div>
  );
};

export default Dashboard;