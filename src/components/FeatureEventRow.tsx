import { useEffect, useState } from "react";
import type { Model } from "../api/modelApi";
import { getHistoricalData } from "../api/historicalApi";
import { formatFeatureName, formatTimestamp } from "../utils/formatting";

interface HistoricalEntry {
  time: string;
  value: number;
}

interface HistoricalData {
  [feature: string]: HistoricalEntry[];
}

interface Event {
  time: string;
  value: number;
  from: string;
  to: string;
  error?: boolean;
}

function useHistoricalData(model: Model, feature: string) {
  const [data, setData] = useState<HistoricalEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historicalData = await getHistoricalData(model.thingId, feature);
        setData(historicalData);
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    };

    fetchData();
  }, [model, feature]);

  return data;
}

function getLastEvent(data: HistoricalEntry[], model: Model, feature: string): Event {
  if (!data || data.length === 0) {
    return {
      from: "Non-Critical",
      to: "Non-Critical",
      time: new Date().toISOString(),
      value: 0,
      error: true,
    };
  }

  let status = (data[data.length - 1].value > model.features[feature].properties.minValue &&
                data[data.length - 1].value < model.features[feature].properties.maxValue)
    ? "Non-Critical"
    : "Critical";

  for (let i = data.length - 1; i >= 0; i--) {
    const auxStatus = (data[i].value > model.features[feature].properties.minValue &&
                       data[i].value < model.features[feature].properties.maxValue)
      ? "Non-Critical"
      : "Critical";

    if (auxStatus !== status) {
      return {
        time: data[i + 1].time,
        value: data[i + 1].value,
        from: auxStatus,
        to: status,
      };
    }
    status = auxStatus;
  }

  return {
    from: status,
    to: status,
    time: data[0].time,
    value: data[0].value,
  };
}

export function FeatureEventRow({ model, featureName, featureData }: { model: Model; featureName: string; featureData: any }) {
  const historicalData = useHistoricalData(model, featureName);
  const event = getLastEvent(historicalData, model, featureName);

  const backgroundColor =
    !event.error
      ? event.to === "Critical"
        ? "#f8d7da"
        : "#d4edda"
      : "#fff";

  return (
    <tr>
      <td style={{ padding: "8px", border: "1px solid #ccc", backgroundColor }}>
        {formatFeatureName(featureName)}
      </td>
      <td style={{ padding: "8px", border: "1px solid #ccc", backgroundColor }}>
        {!event.error ? `${event.value}${featureData.properties.unit}` : "-"}
      </td>
      <td style={{ padding: "8px", border: "1px solid #ccc", backgroundColor }}>
        {featureData.properties?.minValue !== undefined
          ? `${featureData.properties.minValue}${featureData.properties?.unit ? " " + featureData.properties.unit : ""}`
          : "-"}
      </td>
      <td style={{ padding: "8px", border: "1px solid #ccc", backgroundColor }}>
        {featureData.properties?.maxValue !== undefined
          ? `${featureData.properties.maxValue}${featureData.properties?.unit ? " " + featureData.properties.unit : ""}`
          : "-"}
      </td>
      <td style={{ padding: "8px", border: "1px solid #ccc", backgroundColor }}>
        {backgroundColor === "#d4edda"
          ? "Becomes Non-Critical"
          : backgroundColor === "#f8d7da"
          ? "Becomes Critical"
          : "-"}
      </td>
      <td style={{ padding: "8px", border: "1px solid #ccc", backgroundColor }}>
        {!event.error ? formatTimestamp(event.time) : "-"}
      </td>
    </tr>
  );
}