import { useMemo } from "react";
import { Card } from "antd";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
} from "recharts";

interface DataPoint {
  timestamp: number;
  value: number;
  isAnomaly: boolean;
}

interface Anomaly {
  id: string;
  timestamp: number;
  value: number;
  feature: string;
  severity: "low" | "medium" | "high";
  description: string;
}

interface AnomalyChartProps {
  data: DataPoint[];
  anomalies: Anomaly[];
  feature: string;
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function AnomalyChart({ data, anomalies, feature }: AnomalyChartProps) {
  // Prepare data for chart
  const chartData = useMemo(() => {
    return data.map(point => ({
      timestamp: point.timestamp,
      value: point.value,
      isAnomaly: point.isAnomaly,
      displayTime: formatTimestamp(point.timestamp),
    }));
  }, [data]);

  // Separate anomaly points for scatter overlay
  const anomalyPoints = useMemo(() => {
    return anomalies.map(anomaly => ({
      timestamp: anomaly.timestamp,
      value: anomaly.value,
      displayTime: formatTimestamp(anomaly.timestamp),
    }));
  }, [anomalies]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: "12px" }}>
            <strong>Time:</strong> {data.displayTime}
          </p>
          <p
            style={{
              margin: "0",
              fontSize: "12px",
              color: data.isAnomaly ? "#ff4d4f" : "#1890ff",
              fontWeight: "600",
            }}
          >
            <strong>Value:</strong> {data.value.toFixed(2)} {feature === "Temperature" ? "°C" : ""}
            {data.isAnomaly && " ANOMALY"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title="Sensor Data Over Time"
      style={{
        marginBottom: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="displayTime"
            tick={{ fontSize: 12 }}
            interval={Math.floor(chartData.length / 6)} // Show ~6 labels
          />
          <YAxis
            label={{ value: `${feature} Value`, angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
            height={24}
          />

          {/* Main trend line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1890ff"
            dot={false}
            strokeWidth={2}
            name={`${feature} Trend`}
            isAnimationActive={false}
          />

          {/* Anomaly points overlay */}
          {anomalyPoints.length > 0 && (
            <Scatter
              dataKey="value"
              data={anomalyPoints}
              fill="#ff4d4f"
              shape="circle"
              name="Anomalies"
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#fafafa", borderRadius: "4px" }}>
        <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>
          <strong>Chart Information:</strong>
        </p>
        <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#666" }}>
          • Blue line represents the normal sensor data trend
        </p>
        <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
          • Red dots highlight detected anomalies in the data
        </p>
      </div>
    </Card>
  );
}
