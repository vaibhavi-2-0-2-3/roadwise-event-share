import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  MapPin,
  Activity,
  RefreshCw,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

// TypeScript interfaces for API responses
interface PredictionData {
  predicted_demand: number;
  lower_ci: number;
  upper_ci: number;
}

interface BoroughPredictions {
  [borough: string]: PredictionData;
}

interface DemandResponse {
  success: boolean;
  timestamp: string;
  predictions: BoroughPredictions;
  total_demand: number;
  formatted_time: string;
  error?: string;
}

interface GeoResponse {
  success: boolean;
  timestamp: string;
  predictions: BoroughPredictions;
  geojson: any;
  formatted_time: string;
  error?: string;
}

interface ForecastItem {
  timestamp: string;
  hour: string;
  predictions: BoroughPredictions;
  total_demand: number;
}

interface ForecastResponse {
  success: boolean;
  forecast: ForecastItem[];
  error?: string;
}

interface ChartDataPoint {
  time: string;
  [borough: string]: string | number;
  total: number;
}

const NYCTaxiDashboard = () => {
  const [currentDemand, setCurrentDemand] = useState<DemandResponse | null>(
    null
  );
  const [geoData, setGeoData] = useState<GeoResponse | null>(null);
  const [forecastData, setForecastData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  const [map, setMap] = useState<any>(null);
  const [geoLayer, setGeoLayer] = useState<any>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (mapContainer && !map) {
      // Create map centered on NYC
      const L = window.L;
      const newMap = L.map(mapContainer, {
        center: [40.7128, -74.006],
        zoom: 12,
        zoomControl: true,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(newMap);

      setMap(newMap);
    }
  }, [mapContainer, map]);

  // Load current demand data
  const fetchCurrentDemand = async () => {
    setIsLoading(true);
    console.log("fetchDemandWithGeo() called");

    try {
      const response = await fetch(`${API_BASE_URL}/current-demand`);
      const data = await response.json();

      if (data.success) {
        setCurrentDemand(data);
        setLastUpdated(new Date());
      } else {
        console.error("API Error:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load demand with geographic data
  const fetchDemandWithGeo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/demand-with-geo`);
      const data = await response.json();
      console.log("GeoJSON received:", data.geojson);

      if (data.success) {
        setGeoData(data);
        updateMapWithDemand(data);
      }
    } catch (error) {
      console.error("Geo fetch error:", error);
    }
  };

  // Update map with demand data
  const updateMapWithDemand = (data) => {
    console.log("updateMapWithDemand called");
    console.log("Map ready?", !!map);
    console.log("GeoJSON present?", !!data.geojson);
    console.log("Predictions present?", !!data.predictions);
    console.log("GeoJSON features count:", data.geojson?.features?.length || 0);

    if (!map || !data.geojson) return;

    const L = window.L;

    // Remove existing geo layer
    if (geoLayer) {
      map.removeLayer(geoLayer);
    }

    // Get max demand for color scaling
    // const maxDemand = Math.max(
    //   ...Object.values(data.predictions).map((p) => p.predicted_demand)
    // );
    const maxDemand = Math.max(
      ...(Object.values(data.predictions) as PredictionData[]).map(
        (p) => p.predicted_demand
      )
    );

    // Create new geo layer with demand-based styling
    const newGeoLayer = L.geoJSON(data.geojson, {
      style: (feature) => {
        const borough = feature.properties.borough;
        const demand = data.predictions[borough]?.predicted_demand || 0;
        const intensity = maxDemand > 0 ? demand / maxDemand : 0;

        return {
          fillColor: getColorForDemand(intensity),
          weight: 2,
          opacity: 1,
          color: "white",
          fillOpacity: 0.7,
        };
      },
      onEachFeature: (feature, layer) => {
        const borough = feature.properties.borough;
        // const prediction = data.predictions[borough];
        console.log("Feature borough:", borough);
        const prediction = data.predictions[borough] as PredictionData;

        if (prediction) {
          const popupContent = `
            <div style="font-family: sans-serif;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937;">${borough}</h3>
              <p style="margin: 5px 0;"><strong>Predicted Demand:</strong> ${Math.round(
                prediction.predicted_demand
              )}</p>
              <p style="margin: 5px 0;"><strong>Confidence Interval:</strong> ${Math.round(
                prediction.lower_ci
              )} - ${Math.round(prediction.upper_ci)}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #6b7280;">Zone: ${
                feature.properties.zone
              }</p>
            </div>
          `;
          layer.bindPopup(popupContent);
        }
      },
    }).addTo(map);

    setGeoLayer(newGeoLayer);
  };

  // Get color based on demand intensity
  const getColorForDemand = (intensity) => {
    const colors = [
      "#FEF3C7", // Very low - light yellow
      "#FDE68A", // Low - yellow
      "#FBBF24", // Medium-low - amber
      "#F59E0B", // Medium - orange
      "#DC2626", // High - red
      "#7C2D12", // Very high - dark red
    ];

    const index = Math.min(
      Math.floor(intensity * colors.length),
      colors.length - 1
    );
    return colors[index];
  };

  // Fetch hourly forecast
  const fetchHourlyForecast = async (hours = 24) => {
    try {
      const response = await fetch(`${API_BASE_URL}/hourly-forecast/${hours}`);
      const data = await response.json();

      if (data.success) {
        const chartData = data.forecast.map((item) => ({
          time: item.hour,
          ...Object.keys(item.predictions).reduce((acc, borough) => {
            acc[borough] = Math.round(
              item.predictions[borough].predicted_demand
            );
            return acc;
          }, {}),
          total: Math.round(item.total_demand),
        }));
        setForecastData(chartData);
      }
    } catch (error) {
      console.error("Forecast fetch error:", error);
    }
  };

  // Fetch demand for specific datetime
  const fetchSpecificDemand = async () => {
    if (!selectedDateTime) return;

    try {
      const formattedDateTime = selectedDateTime
        .replace("T", "-")
        .substring(0, 13);
      const response = await fetch(
        `${API_BASE_URL}/demand/${formattedDateTime}`
      );
      const data = await response.json();

      if (data.success) {
        setCurrentDemand(data);
      }
    } catch (error) {
      console.error("Specific demand fetch error:", error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchCurrentDemand();
    // fetchDemandWithGeo();
    fetchHourlyForecast();

    // Add Leaflet CSS and JS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        console.log("Leaflet loaded");
      };
      document.head.appendChild(script);
    }
  }, []);

  // When the map is ready, then fetch geo data
  useEffect(() => {
    if (map) {
      fetchDemandWithGeo();
    }
  }, [map]);

  const refreshData = () => {
    fetchCurrentDemand();
    fetchDemandWithGeo();
    fetchHourlyForecast();
  };

  const boroughs = [
    "Manhattan",
    "Brooklyn",
    "Queens",
    "Bronx",
    "Staten Island",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Calendar className="text-yellow-500" />
          NYC Taxi Demand Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Real-time taxi demand predictions powered by SARIMA models
        </p>
        {lastUpdated && (
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Demand</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentDemand ? Math.round(currentDemand.total_demand) : "--"}
            </div>
            <p className="text-xs text-muted-foreground">
              Current hour prediction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Borough</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentDemand
                ? Object.entries(currentDemand.predictions).reduce((a, b) =>
                    a[1].predicted_demand > b[1].predicted_demand ? a : b
                  )[0]
                : "--"}
            </div>
            <p className="text-xs text-muted-foreground">
              Highest predicted demand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading" : "Live"}
            </div>
            <p className="text-xs text-muted-foreground">
              API connection status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button
              onClick={refreshData}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              {isLoading ? "Refreshing..." : "Refresh Data"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="map" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map">Live Map</TabsTrigger>
          <TabsTrigger value="forecast">Hourly Forecast</TabsTrigger>
          <TabsTrigger value="boroughs">Borough Analysis</TabsTrigger>
          <TabsTrigger value="custom">Custom Query</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>NYC Taxi Zones - Live Demand</CardTitle>
              <CardDescription>
                Interactive map showing predicted taxi demand by area. Darker
                colors indicate higher demand.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                ref={setMapContainer}
                className="h-96 w-full rounded-lg border"
                style={{ minHeight: "500px" }}
              />

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center space-x-4">
                <span className="text-sm text-gray-600">Demand Level:</span>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#FEF3C7" }}
                  ></div>
                  <span className="text-xs">Low</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#FBBF24" }}
                  ></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#DC2626" }}
                  ></div>
                  <span className="text-xs">High</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Demand Forecast</CardTitle>
              <CardDescription>
                Hourly predictions for taxi demand across all boroughs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#1f2937"
                      strokeWidth={3}
                      name="Total"
                    />
                    <Line
                      type="monotone"
                      dataKey="Manhattan"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Brooklyn"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Queens"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Bronx"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Staten Island"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boroughs">
          <Card>
            <CardHeader>
              <CardTitle>Current Demand by Borough</CardTitle>
              <CardDescription>
                Real-time demand predictions with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentDemand &&
                  Object.entries(currentDemand.predictions).map(
                    ([borough, data]) => (
                      <div key={borough} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-lg">{borough}</h3>
                          <span className="text-2xl font-bold text-blue-600">
                            {Math.round(data.predicted_demand)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>
                            Confidence Interval: {Math.round(data.lower_ci)} -{" "}
                            {Math.round(data.upper_ci)}
                          </span>
                          <span>
                            {(
                              (data.predicted_demand /
                                currentDemand.total_demand) *
                              100
                            ).toFixed(1)}
                            % of total
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (data.predicted_demand /
                                  currentDemand.total_demand) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Time Query</CardTitle>
              <CardDescription>
                Get demand predictions for a specific date and time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="datetime-input">Select Date and Time</Label>
                  <Input
                    id="datetime-input"
                    type="datetime-local"
                    value={selectedDateTime}
                    onChange={(e) => setSelectedDateTime(e.target.value)}
                  />
                </div>
                <Button
                  onClick={fetchSpecificDemand}
                  disabled={!selectedDateTime}
                >
                  Query Demand
                </Button>
              </div>

              {selectedDateTime && currentDemand && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">
                    Predictions for {currentDemand.formatted_time}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(currentDemand.predictions).map(
                      ([borough, data]) => (
                        <div
                          key={borough}
                          className="bg-white p-3 rounded shadow"
                        >
                          <div className="font-medium">{borough}</div>
                          <div className="text-xl font-bold text-blue-600">
                            {Math.round(data.predicted_demand)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ±{Math.round((data.upper_ci - data.lower_ci) / 2)}{" "}
                            trips
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NYCTaxiDashboard;
