import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RangerDashboard.css';
import { getImageResults, getXgbResults, mapview } from '../endpoint/api';
import { useNotifications } from '../components/useNotifications';

const poacherIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const elephantIcon = L.AwesomeMarkers?.icon
  ? L.AwesomeMarkers.icon({ icon: 'paw', prefix: 'fa', markerColor: 'blue' })
  : null;

const rhinoIcon = L.AwesomeMarkers?.icon
  ? L.AwesomeMarkers.icon({ icon: 'paw', prefix: 'fa', markerColor: 'red' })
  : null;

const mapCenter = [-21.8584729, 31.6473187];

const RangerDashboard = ({ username = 'Ranger', onLogout }) => {
  const [poacherDetected, setPoacherDetected] = useState(false);
  const [poacherLocation, setPoacherLocation] = useState(null);
  const [poacherImageUrl, setPoacherImageUrl] = useState('');
  const [elephantLocations, setElephantLocations] = useState([]);
  const [rhinoLocations, setRhinoLocations] = useState([]);
  
  // Notification states
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const audioRef = useRef(null);
  
  // Use the notification hook
  const { notifications, count, markAsRead } = useNotifications('ranger');

  // Play sound when new notifications arrive
  useEffect(() => {
    if (count > 0) {
      try {
        const audio = new Audio('/alarm.mp3');
        audio.play().catch(e => console.log("Audio play failed:", e));
      } catch (error) {
        console.error("Error playing notification sound:", error);
      }
    }
  }, [count]);

  // Fetch animal locations
  useEffect(() => {
    const fetchAnimalLocations = async () => {
      try {
        const data = await mapview();
        setElephantLocations(data.elephants || []);
        setRhinoLocations(data.rhinos || []);
      } catch (error) {
        console.error('Error fetching animal locations:', error);
      }
    };

    fetchAnimalLocations();
    const interval = setInterval(fetchAnimalLocations, 50000);
    return () => clearInterval(interval);
  }, []);

  // Fetch poacher detection and image results
  useEffect(() => {
    const fetchPoacherData = async () => {
      try {
        const xgbResponse = await getXgbResults();
        const xgbResults = xgbResponse.xgb_results || [];
        const poacherPreds = xgbResults.filter((p) => p.prediction === 'poacher');

        if (poacherPreds.length === 0) {
          // No movement-based poacher prediction
          setPoacherDetected(false);
          setPoacherLocation(null);
          setPoacherImageUrl('');
          return;
        }

        // Now check the image classifier
        const imageResponse = await getImageResults();
        const imageResults = imageResponse.image_results || [];
        const poacherImage = imageResults.find(
          (ir) => ir.class_name.toLowerCase() === 'poacher'
        );

        if (poacherImage && poacherImage.image_url) {
          // Only set detection true if image classifier confirms poacher
          const poacher = poacherPreds[0];
          setPoacherLocation({ lat: poacher.latitude, lng: poacher.longtitude });
          setPoacherDetected(true);
          setPoacherImageUrl(`http://localhost:8000${poacherImage.image_url}`);
        } else {
          // Movement suggested poacher, but no image confirmation
          setPoacherDetected(false);
          setPoacherLocation(null);
          setPoacherImageUrl('');
        }
      } catch (error) {
        console.error('Error fetching poacher data:', error);
        setPoacherDetected(false);
        setPoacherLocation(null);
        setPoacherImageUrl('');
      }
    };

    fetchPoacherData();
    const interval = setInterval(fetchPoacherData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Clear notification when poacher popup viewed
  const onPoacherPopupOpen = () => {
    // This is handled by the notification system now
  };

  // Toggle notification panel
  const toggleNotificationPanel = () => {
    if (showNotificationPanel) {
      markAsRead();
      setShowNotificationPanel(false);
    } else {
      setShowNotificationPanel(true);
    }
  };

  // Format notification timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Format notification date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="ranger-dashboard">
      <header className="ranger-header">
        <div className="ranger-title">Ranger Dashboard</div>
        <div className="ranger-user-area">
          <span className="ranger-username"> {username}</span>

          <div className="notification-container">
            <div
              className="notification-bell"
              onClick={toggleNotificationPanel}
              title="Notifications"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleNotificationPanel()}
            >
              <i
                className="fa fa-bell"
                style={{ fontSize: '1.4rem', cursor: 'pointer', position: 'relative' }}
              />
              {count > 0 && <span className="notification-badge">{count}</span>}
            </div>
            
            {showNotificationPanel && (
              <div className="notification-panel">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button 
                    className="close-panel"
                    onClick={() => {
                      markAsRead();
                      setShowNotificationPanel(false);
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div key={index} className="notification-item">
                        <div className="notification-content">
                          <strong>{notification.title}</strong>
                          <p>{notification.message}</p>
                          <small>
                            {formatDate(notification.timestamp)} at {formatTime(notification.timestamp)}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-notifications">No notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="ranger-logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="ranger-main">
        <section className="ranger-map-section">
          <MapContainer
            center={mapCenter}
            zoom={11}
            minZoom={9}
            maxZoom={15}
            scrollWheelZoom
            dragging
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Animal locations */}
            {elephantLocations.map((loc) => (
              <Marker
                key={`elephant-${loc.id}`}
                position={[loc.latitude, loc.longitude]}
                icon={elephantIcon}
              >
                <Popup>
                  Elephant ID: {loc.id}
                  <br />
                  Coords: ({loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)})
                </Popup>
              </Marker>
            ))}

            {rhinoLocations.map((loc) => (
              <Marker
                key={`rhino-${loc.id}`}
                position={[loc.latitude, loc.longitude]}
                icon={rhinoIcon}
              >
                <Popup>
                  Rhino ID: {loc.id}
                  <br />
                  Coords: ({loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)})
                </Popup>
              </Marker>
            ))}

            {/* Poacher marker */}
            {poacherDetected && poacherLocation && (
              <Marker position={[poacherLocation.lat, poacherLocation.lng]} icon={poacherIcon}>
                <Popup eventHandlers={{ open: onPoacherPopupOpen }}>
                  <div>
                    <strong>Poacher Location</strong>
                    <br />
                    Coords: ({poacherLocation.lat.toFixed(6)}, {poacherLocation.lng.toFixed(6)})
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </section>

        <section className="ranger-poacher-info">
          {poacherDetected ? (
            <>
              <h3 className="poacher-alert">Poacher Detected!</h3>
              {poacherLocation && (
                <p className="poacher-location">
                  Location: ({poacherLocation.lat.toFixed(6)}, {poacherLocation.lng.toFixed(6)})
                </p>
              )}
              <img src={poacherImageUrl} alt="Poacher Detected" className="poacher-image" />
            </>
          ) : (
            <p className="no-poacher-message">No poacher detected at the moment.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default RangerDashboard;