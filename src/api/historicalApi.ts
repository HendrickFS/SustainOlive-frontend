import { historicalApi } from "./axios";

export const getHistoricalData = async (thingId: string, feature: string, range = "-24h") => {
  const response = await historicalApi.get("/data", {
    params: {
      thingId,
      feature,
      range_start: range
    }
  });
  return response.data;
};

export interface AnomalyResponse {
  device: string;
  feature: string;
  training_points: number;
  prediction_points: number;
  anomalies_detected: number;
  anomaly_percentage: number;
  data: AnomalyDataPoint[];
}

export interface AnomalyDataPoint {
  time: string;
  value: number;
  anomaly: boolean;
  score: number;
}

export const checkAnomaly = async (
  thingId: string,
  feature: string,
  options?: {
    range_start?: string;
    training_range?: string;
    latest?: boolean;
    dedup?: boolean;
  }
): Promise<AnomalyResponse> => {
  const response = await historicalApi.get("/ml/anomaly", {
    params: {
      thingId,
      feature: feature.charAt(0).toLowerCase() + feature.slice(1),
      range_start: options?.range_start || "-1h",
      training_range: options?.training_range || "-24h",
      latest: options?.latest ?? false,
      dedup: options?.dedup ?? false
    }
  });
  return response.data;
};
