import { ReactNode } from 'react';
import { MapContainer, TileLayer, MapContainerProps } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface ChargingStationMapContainerProps {
  center: [number, number];
  zoom: number;
  children: ReactNode;
  style?: React.CSSProperties;
}

const ChargingStationMapContainer = ({ 
  center, 
  zoom, 
  children, 
  style = { height: '400px', width: '100%' } 
}: ChargingStationMapContainerProps) => {
  return (
    <MapContainer 
      style={style}
      center={center}
      zoom={zoom} 
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
};

export default ChargingStationMapContainer;
