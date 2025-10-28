import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

const createCustomIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapView = ({ elephantLocations, rhinoLocations }) => {
  const mapCenter = [-21.8584729, 31.6473187];
  const elephantIcon = createCustomIcon('blue');
  const rhinoIcon = createCustomIcon('red');

  return (
    <div className="map-container">
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
        
        {elephantLocations.map((loc) => (
          <Marker key={`elephant-${loc.id}`} position={[loc.latitude, loc.longitude]} icon={elephantIcon}>
            <Popup>Elephant ID: {loc.id}<br />Coords: ({loc.latitude}, {loc.longitude})</Popup>
          </Marker>
        ))}
        
        {rhinoLocations.map((loc) => (
          <Marker key={`rhino-${loc.id}`} position={[loc.latitude, loc.longitude]} icon={rhinoIcon}>
            <Popup>Rhino ID: {loc.id}<br />Coords: ({loc.latitude}, {loc.longitude})</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;