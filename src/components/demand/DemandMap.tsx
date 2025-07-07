import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useDemandData } from "@/hooks/useDemandData";
import L from "leaflet";

const getColor = (demand: number) => {
  if (demand > 3000) return "#1e40af"; // dark blue
  if (demand > 1000) return "#3b82f6"; // medium blue
  if (demand > 100) return "#60a5fa"; // light blue
  if (demand > 10) return "#93c5fd"; // very light blue
  return "#e5e7eb"; // gray
};

const style = (feature: any) => ({
  fillColor: getColor(feature.properties.predicted_demand || 0),
  weight: 1,
  opacity: 1,
  color: "white",
  fillOpacity: 0.7,
});

const onEachFeature = (feature: any, layer: L.Layer) => {
  const props = feature.properties;
  if (layer instanceof L.Path) {
    layer.bindTooltip(
      `<strong>${props.zone}</strong><br/>Demand: ${Math.round(
        props.predicted_demand || 0
      )}`,
      { sticky: true }
    );
  }
};

const GeoJSONWithAutoFit = ({ data }: { data: any }) => {
  const map = useMap();

  useEffect(() => {
    if (data) {
      const geoLayer = L.geoJSON(data);
      const bounds = geoLayer.getBounds();
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [data, map]);

  return <GeoJSON data={data} style={style} onEachFeature={onEachFeature} />;
};

const DemandMap = () => {
  const { data, isLoading, error } = useDemandData();

  if (isLoading) return <div>Loading map...</div>;
  if (error)
    return <div className="text-red-500">Failed to load map data.</div>;
  console.log("Rendering DemandMap component...");

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <MapContainer
        center={[40.7128, -74.006]} // NYC center
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data?.geojson && <GeoJSONWithAutoFit data={data.geojson} />}
      </MapContainer>
    </div>
  );
};

export default DemandMap;
