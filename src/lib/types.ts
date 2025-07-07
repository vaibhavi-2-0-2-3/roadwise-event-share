import type { Feature, FeatureCollection, Geometry } from "geojson";

// Borough-level prediction values from the API
export interface BoroughPrediction {
  predicted_demand: number;
  lower_ci: number;
  upper_ci: number;
}

// Full API response from /api/demand-with-geo
export interface DemandWithGeoResponse {
  success: boolean;
  timestamp: string;
  formatted_time: string;
  predictions: Record<string, BoroughPrediction>;
  geojson: FeatureCollection;
}

// Properties inside each Taxi Zone feature
export interface TaxiZoneProperties {
  LocationID: number;
  zone: string;
  borough: string;
  service_zone?: string;
  predicted_demand?: number;
}

// Single zone feature type
export type TaxiZoneFeature = Feature<Geometry, TaxiZoneProperties>;
