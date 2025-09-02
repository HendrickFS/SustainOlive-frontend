import { use, useEffect, useState } from "react";
import { getHistoricalData } from "../api/historicalApi";
import { getModels, type Model } from "../api/modelApi";
import {
  formatFeatureName,
  formatName,
  formatTimestamp,
} from "../utils/formatting";
import { useNavigate } from "react-router-dom";
import { FeatureEventRow } from "./FeatureEventRow";

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

function getLastEvent(
  data: HistoricalEntry[],
  model: Model,
  feature: string
): Event {
  if (!data || data.length === 0) {
    return {
      from: "Non-Critical",
      to: "Non-Critical",
      time: new Date().toISOString(),
      value: 0,
      error: true,
    };
  }

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
      return {
        time: data[i].time,
        value: data[i].value,
        from: status,
        to: auxStatus,
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

export function AllEventsList() {
  const [data, setData] = useState<Model[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchModels = async () => {
      const models = await getModels();
      setModels(models);
    };
    fetchModels();
  }, []);

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: "100%",
        height: "100vh",
        overflowY: "auto",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
      }}
    >
      {models.map((model) => (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            margin: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ fontFamily: "Inter, sans-serif" }}>
              {formatName(model.thingId)}
            </h3>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#fff",
                color: "#2196F3",
                border: "1px solid #2196F3",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/device-events/${model.thingId}`)}
            >
              View Device Events
            </button>
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
              {Object.entries(model.features).map(([name, featureData]) => (
                <FeatureEventRow
                  key={name}
                  model={model}
                  featureName={name}
                  featureData={featureData}
                />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
