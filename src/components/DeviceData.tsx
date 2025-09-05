import { useEffect, useState } from "react";
import { getModel, type Model } from "../api/modelApi";
import { getHistoricalData } from "../api/historicalApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { formatFeatureName, formatName } from "../utils/formatting";

interface HistoricalEntry {
  time: string;
  value: number;
}

interface HistoricalData {
  [feature: string]: HistoricalEntry[];
}

export function DeviceData({ thingId }: { thingId: string }) {
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [historicalData, setHistoricalData] = useState<HistoricalData>({});

  useEffect(() => {
    const fetchModel = async () => {
      const data = await getModel(thingId);
      setModel(data);
      setLoading(false);
    };
    fetchModel();
  }, [thingId]);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!model) return;

      try {
        const featurePromises = Object.entries(model.features).map(
          async ([featureName, featureData]) => {
            const data = await getHistoricalData(model.thingId, featureName);
            return { featureName, data };
          }
        );
        const results = await Promise.all(featurePromises);
        const dataByFeature: Record<string, any> = {};
        results.forEach(({ featureName, data }) => {
          dataByFeature[featureName] = data;
        });
        setHistoricalData(dataByFeature);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchHistoricalData();
  }, [model]);

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
      <div
  style={{
    marginBottom: "24px",
    width: "100%",
    padding: "16px",
    backgroundColor: "#f9f9f9",
    borderLeft: "4px solid #2C2803",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  }}
>
  <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#333" }}>
    {formatName(thingId)}
  </h2>
  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
    <strong>Thing ID:</strong> {thingId}
  </p>
</div>
      {Object.entries(historicalData).map(([feature, entries]) => (
        <div
          key={feature}
          style={{
            marginBottom: "24px",
            width: "100%",
            backgroundColor: "#f9f9f9",
            border: "1px solid #eee",
            borderRadius: "4px",
            padding: "12px",
          }}
        >
          <h3>{formatFeatureName(feature)}</h3>
          <div style={{ height: "16px" }}></div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={entries}>
              <XAxis
                dataKey="time"
                tickFormatter={(time) => {
                  const date = new Date(time);
                  return date.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }}
                interval={10}
              />
              <YAxis
                // domain={[
                //   (dataMin: number) =>
                //     Math.min(
                //       dataMin,
                //       Number(
                //         0
                //       )
                //     ),
                //   (dataMax: number) =>
                //     Math.max(
                //       dataMax,
                //       Number(
                //         model?.features[feature]?.properties.maxValue ?? dataMax
                //       )
                //     ),
                // ]}
                label={{
                  value: model?.features[feature]?.properties.unit || "",
                  position: "top",
                  offset: 0,
                  angle: 0,
                  style: { textAnchor: "middle" },
                  dy: 10,
                  dx: -10,
                }}
              />
              <ReferenceArea
                y1={model?.features[feature]?.properties.minValue}
                y2={model?.features[feature]?.properties.maxValue}
                fill="green"
                fillOpacity={0.1}
              />
              <ReferenceArea
                y1={model?.features[feature]?.properties.maxValue}
                fill="red"
                fillOpacity={0.1}
              />
              <ReferenceArea
                y2={model?.features[feature]?.properties.minValue}
                fill="red"
                fillOpacity={0.1}
              />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
          <div
  style={{
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
    gap: "16px",
    marginLeft: "24px",
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
    <div
      style={{
        width: "20px",
        height: "12px",
        backgroundColor: "#e6ffe6",
        border: "1px solid #ccc",
        borderRadius: "2px",
      }}
    ></div>
    <span style={{ fontSize: "14px", color: "#333" }}>Non-Critical ({model?.features[feature]?.properties.minValue} - {model?.features[feature]?.properties.maxValue})</span>
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
    <div
      style={{
        width: "20px",
        height: "12px",
        backgroundColor: "#ffe5e5",
        border: "1px solid #ccc",
        borderRadius: "2px",
      }}
    ></div>
    <span style={{ fontSize: "14px", color: "#333" }}>Critical</span>
  </div>
</div>
        </div>
      ))}
    </div>
  );
}
