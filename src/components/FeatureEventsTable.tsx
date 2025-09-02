import { useEffect, useState } from "react";
import type { Model } from "../api/modelApi";
import { getHistoricalData } from "../api/historicalApi";
import {
  formatFeatureName,
  formatName,
  formatTimestamp,
} from "../utils/formatting";

interface HistoricalEntry {
  time: string;
  value: number;
}

interface Event {
  time: string;
  value: number;
  from: string;
  to: string;
  error?: boolean;
}

function getEvents(
  data: HistoricalEntry[],
  model: Model,
  feature: string
): Event[] {
  if (!data || data.length === 0) {
    return [];
  }

  let events: Event[] = [];
  let status =
    data[data.length - 1].value > model.features[feature].properties.minValue &&
    data[data.length - 1].value < model.features[feature].properties.maxValue
      ? "Non-Critical"
      : "Critical";

  for (let i = data.length - 1; i >= 0; i--) {
    const auxStatus =
      data[i].value > model.features[feature].properties.minValue &&
      data[i].value < model.features[feature].properties.maxValue
        ? "Non-Critical"
        : "Critical";

    if (auxStatus !== status) {
      events.push({
        time: data[i + 1].time,
        value: data[i + 1].value,
        from: auxStatus,
        to: status,
      });
    }
    status = auxStatus;
  }

  return events;
}

export function FeatureEventsTable({
  model,
  featureName,
  featureData,
}: {
  model: Model;
  featureName: string;
  featureData: any;
}) {
  const [data, setData] = useState<HistoricalEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historicalData = await getHistoricalData(
          model.thingId,
          featureName
        );
        setData(historicalData);
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    };

    fetchData();
  }, [model, featureName]);

  const events = getEvents(data, model, featureName);

  return (
   <div
          key={featureName}
          style={{
            marginBottom: "24px",
            width: "100%",
            backgroundColor: "#f9f9f9",
            border: "1px solid #eee",
            borderRadius: "4px",
            padding: "12px",
          }}
        >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "start",
        }}
      >
        <h3 style={{ fontFamily: "Inter, sans-serif" }}>
          {formatFeatureName(featureName)}
        </h3>
      </div>
      
      <table
        style={{
              borderCollapse: "collapse",
              width: "100%",
              marginTop: "8px",
              fontFamily: "Arial, sans-serif",
              tableLayout: "fixed",
            }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                width: "20%",
                textAlign: "left",
              }}
            >
              Feature
            </th>
            <th
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                width: "20%",
                textAlign: "left",
              }}
            >
              Value
            </th>
            <th
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                width: "15%",
                textAlign: "left",
              }}
            >
              Minimum Value
            </th>
            <th
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                width: "15%",
                textAlign: "left",
              }}
            >
              Maximum Value
            </th>
            <th
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                width: "15%",
                textAlign: "left",
              }}
            >
              Event
            </th>
            <th
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                width: "15%",
                textAlign: "left",
              }}
            >
              Event Time
            </th>
          </tr>
        </thead>
        <tbody>
        {events.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: "8px", textAlign: "center" }}>
                No events found for {formatFeatureName(featureName)}.
              </td>
            </tr>
          )}
          {events.map((event, index) => (
            <tr key={index}>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    event.to == "Non-Critical" ? "#d4edda" : "#f8d7da",
                }}
              >
                {formatFeatureName(featureName)}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    event.to == "Non-Critical" ? "#d4edda" : "#f8d7da",
                }}
              >
                {!event.error
                  ? `${event.value}${featureData.properties.unit}`
                  : "-"}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    event.to == "Non-Critical" ? "#d4edda" : "#f8d7da",
                }}
              >
                {featureData.properties?.minValue !== undefined
                  ? `${featureData.properties.minValue}${
                      featureData.properties?.unit
                        ? " " + featureData.properties.unit
                        : ""
                    }`
                  : "-"}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    event.to == "Non-Critical" ? "#d4edda" : "#f8d7da",
                }}
              >
                {featureData.properties?.maxValue !== undefined
                  ? `${featureData.properties.maxValue}${
                      featureData.properties?.unit
                        ? " " + featureData.properties.unit
                        : ""
                    }`
                  : "-"}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    event.to == "Non-Critical" ? "#d4edda" : "#f8d7da",
                }}
              >
                {event.to == "Non-Critical"
                  ? "Becomes Non-Critical"
                  : event.to == "Critical"
                  ? "Becomes Critical"
                  : "-"}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    event.to == "Non-Critical" ? "#d4edda" : "#f8d7da",
                }}
              >
                {!event.error ? formatTimestamp(event.time) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
