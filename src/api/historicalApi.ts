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
