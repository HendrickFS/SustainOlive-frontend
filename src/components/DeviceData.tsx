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

const ranges = ["-1h", "-6h", "-12h", "-24h", "-7d", "-30d"];

export function DeviceData({ thingId }: { thingId: string }) {
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [historicalData, setHistoricalData] = useState<HistoricalData>({});
  const [range, setRange] = useState<string>("-24h");

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
            const data = await getHistoricalData(
              model.thingId,
              featureName,
              range
            );
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
  }, [model, range]);

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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h2
              style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#333" }}
            >
              {formatName(thingId)}
            </h2>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
              <strong>Thing ID:</strong> {thingId}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="timeRange"
              style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}
            >
              Time Range
            </label>
            <select
              id="timeRange"
              name="timeRange"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              style={{
                borderRadius: "5px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                padding: "8px 12px",
                fontSize: "14px",
                color: "#374151",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                outline: "none",
                transition: "all 0.2s ease",
              }}
            >
              {ranges.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
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
                tick={false}
              />
              <YAxis
                domain={(() => {
                  // Get actual data values for dynamic range calculation
                  const dataValues = entries.map(entry => entry.value);
                  const actualDataMin = Math.min(...dataValues);
                  const actualDataMax = Math.max(...dataValues);
                  const dataRange = actualDataMax - actualDataMin;
                  
                  // Get threshold values
                  const minThreshold = model?.features[feature]?.properties.minValue;
                  const maxThreshold = model?.features[feature]?.properties.maxValue;
                  
                  // Calculate dynamic padding (minimum 10% of data range, or absolute value if range is small)
                  const basePadding = Math.max(dataRange * 0.1, Math.abs(actualDataMax - actualDataMin) * 0.1);
                  const padding = dataRange < 0.01 ? 0.1 : basePadding;
                  
                  // Calculate domain bounds focused on data
                  let domainMin = actualDataMin - padding;
                  let domainMax = actualDataMax + padding;
                  
                  // Extend domain slightly if thresholds are very close to data range
                  if (minThreshold !== undefined) {
                    const bufferBelowMin = Math.abs(minThreshold) * 0.05;
                    if (actualDataMin <= minThreshold + dataRange * 0.2) {
                      domainMin = Math.min(domainMin, minThreshold - bufferBelowMin);
                    }
                  }
                  
                  if (maxThreshold !== undefined) {
                    const bufferAboveMax = Math.abs(maxThreshold) * 0.05;
                    if (actualDataMax >= maxThreshold - dataRange * 0.2) {
                      domainMax = Math.max(domainMax, maxThreshold + bufferAboveMax);
                    }
                  }
                  
                  return [domainMin, domainMax];
                })()}
                tickFormatter={(value) => {
                  // Smart rounding based on the value range
                  if (Math.abs(value) >= 1000) {
                    return Math.round(value).toString();
                  } else if (Math.abs(value) >= 100) {
                    return (Math.round(value * 10) / 10).toString();
                  } else if (Math.abs(value) >= 10) {
                    return (Math.round(value * 100) / 100).toString();
                  } else if (Math.abs(value) >= 1) {
                    return (Math.round(value * 1000) / 1000).toString();
                  } else {
                    return parseFloat(value.toFixed(4)).toString();
                  }
                }}
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
              {/* Smart reference areas that adapt to visible domain */}
              {(() => {
                const minThreshold = model?.features[feature]?.properties.minValue;
                const maxThreshold = model?.features[feature]?.properties.maxValue;
                
                if (minThreshold === undefined || maxThreshold === undefined) return null;
                
                // Calculate current domain
                const dataValues = entries.map(entry => entry.value);
                const actualDataMin = Math.min(...dataValues);
                const actualDataMax = Math.max(...dataValues);
                const dataRange = actualDataMax - actualDataMin;
                const basePadding = Math.max(dataRange * 0.1, Math.abs(actualDataMax - actualDataMin) * 0.1);
                const padding = dataRange < 0.01 ? 0.1 : basePadding;
                
                let domainMin = actualDataMin - padding;
                let domainMax = actualDataMax + padding;
                
                // Check if data is always in critical zones
                const dataAlwaysBelowMin = actualDataMax < minThreshold;
                const dataAlwaysAboveMax = actualDataMin > maxThreshold;
                
                // Always ensure thresholds are visible when data is in critical zones
                if (dataAlwaysBelowMin) {
                  // Data always below minimum - force include threshold with buffer
                  domainMax = Math.max(domainMax, minThreshold + Math.abs(minThreshold - actualDataMax) * 0.1);
                } else if (dataAlwaysAboveMax) {
                  // Data always above maximum - force include threshold with buffer
                  domainMin = Math.min(domainMin, maxThreshold - Math.abs(actualDataMin - maxThreshold) * 0.1);
                } else {
                  // Data crosses or is near thresholds - extend domain if close
                  if (actualDataMin <= minThreshold + dataRange * 0.2) {
                    domainMin = Math.min(domainMin, minThreshold - Math.abs(minThreshold) * 0.05);
                  }
                  if (actualDataMax >= maxThreshold - dataRange * 0.2) {
                    domainMax = Math.max(domainMax, maxThreshold + Math.abs(maxThreshold) * 0.05);
                  }
                }
                
                // Determine which zones to show based on data position
                const areas = [];
                
                // If data is always below minimum threshold - show red background
                if (dataAlwaysBelowMin) {
                  areas.push(
                    <ReferenceArea key="critical-low" y1={domainMin} y2={domainMax} fill="red" fillOpacity={0.1} />
                  );
                  // Show green zone boundary if threshold is visible
                  if (domainMax > minThreshold) {
                    areas.push(
                      <ReferenceArea key="safe-indicator" y1={minThreshold} y2={domainMax} fill="green" fillOpacity={0.1} />
                    );
                  }
                }
                // If data is always above maximum threshold - show red background  
                else if (dataAlwaysAboveMax) {
                  areas.push(
                    <ReferenceArea key="critical-high" y1={domainMin} y2={domainMax} fill="red" fillOpacity={0.1} />
                  );
                  // Show green zone boundary if threshold is visible
                  if (domainMin < maxThreshold) {
                    areas.push(
                      <ReferenceArea key="safe-indicator" y1={domainMin} y2={maxThreshold} fill="green" fillOpacity={0.1} />
                    );
                  }
                }
                // Normal case - show zones based on thresholds
                else {
                  // Green zone between thresholds
                  if (domainMax > minThreshold && domainMin < maxThreshold) {
                    areas.push(
                      <ReferenceArea 
                        key="safe-zone"
                        y1={Math.max(minThreshold, domainMin)}
                        y2={Math.min(maxThreshold, domainMax)}
                        fill="green"
                        fillOpacity={0.1}
                      />
                    );
                  }
                  
                  // Red zone above max
                  if (domainMax > maxThreshold) {
                    areas.push(
                      <ReferenceArea 
                        key="critical-high"
                        y1={Math.max(maxThreshold, domainMin)}
                        y2={domainMax}
                        fill="red"
                        fillOpacity={0.1}
                      />
                    );
                  }
                  
                  // Red zone below min
                  if (domainMin < minThreshold) {
                    areas.push(
                      <ReferenceArea 
                        key="critical-low"
                        y1={domainMin}
                        y2={Math.min(minThreshold, domainMax)}
                        fill="red"
                        fillOpacity={0.1}
                      />
                    );
                  }
                }
                
                return <>{areas}</>;
              })()}
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
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
              <span style={{ fontSize: "14px", color: "#333" }}>
                Non-Critical ({model?.features[feature]?.properties.minValue} -{" "}
                {model?.features[feature]?.properties.maxValue})
              </span>
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
