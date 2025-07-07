// components/LiveTracking/RideMapView.tsx
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

interface LatLng {
  lat: number;
  lng: number;
  name?: string;
}

interface RideMapViewProps {
  myLocation: LatLng | null;
  otherUsers: LatLng[];
}

// Leaflet icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function Recenter({ latlng }: { latlng: LatLng | null }) {
  const map = useMap();

  useEffect(() => {
    if (latlng) {
      map.setView([latlng.lat, latlng.lng], 15);
    }
  }, [latlng, map]);

  return null;
}

export default function RideMapView({ myLocation, otherUsers }: RideMapViewProps) {
  const center = myLocation || { lat: 40.7128, lng: -74.006 };

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={15}
      style={{ height: "400px", width: "100%", marginTop: "1rem" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter latlng={myLocation} />

      {myLocation && (
        <Marker position={[myLocation.lat, myLocation.lng]}>
          <Tooltip permanent direction="top" offset={[0, -10]}>
            📍 You ({myLocation.name})
          </Tooltip>
          <Popup>📍 You ({myLocation.name})</Popup>
        </Marker>
      )}

      {otherUsers.map((user, i) => (
        <Marker key={i} position={[user.lat, user.lng]}>
          <Tooltip permanent direction="top" offset={[0, -10]}>
            👤 {user.name}
          </Tooltip>
          <Popup>👤 {user.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
