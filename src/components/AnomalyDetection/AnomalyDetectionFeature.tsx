import { useState, useMemo, useEffect } from "react";
import { ControlPanel } from "./ControlPanel";
import { SummaryCards } from "./SummaryCards";
import { AnomalyChart } from "./AnomalyChart";
import { AnomalyLog } from "./AnomalyLog";
import { checkAnomaly, type AnomalyDataPoint } from "../../api/historicalApi";
import { Spin, message } from "antd";

// Mock data interface
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

// Convert API response to DataPoint format
const convertAnomalyDataToChartData = (data: AnomalyDataPoint[]): DataPoint[] => {
  return data.map(point => ({
    timestamp: new Date(point.time).getTime(),
    value: point.value,
    isAnomaly: point.anomaly,
  }));
};

// Convert anomaly data to Anomaly format
const convertToAnomalies = (data: AnomalyDataPoint[], feature: string): Anomaly[] => {
  return data
    .filter(point => point.anomaly)
    .map((point, idx) => {
      // Calculate severity based on anomaly score (lower score = more anomalous)
      const severity: "low" | "medium" | "high" = 
        point.score < 0.3 ? "high" : point.score < 0.6 ? "medium" : "low";
      
      return {
        id: `anomaly_${idx}`,
        timestamp: new Date(point.time).getTime(),
        value: point.value,
        feature,
        severity,
        description: `Anomaly detected in ${feature}: value ${point.value} (score: ${point.score.toFixed(2)})`,
      };
    });
};

// Mock data generator (fallback)
const generateMockData = (): DataPoint[] => {
  const data: DataPoint[] = [];
  const now = Date.now();
  
  for (let i = 0; i < 288; i++) { // 288 points = 24 hours at 5-min intervals
    const timestamp = now - (287 - i) * 5 * 60 * 1000;
    let value = 20 + Math.sin(i / 48) * 5 + Math.random() * 2;
    
    // Add some anomalies
    const isAnomaly = Math.random() < 0.05; // 5% chance of anomaly
    if (isAnomaly) {
      value = value + (Math.random() < 0.5 ? 10 : -10);
    }
    
    data.push({
      timestamp,
      value: Math.round(value * 100) / 100,
      isAnomaly,
    });
  }
  
  return data;
};

const generateMockAnomalies = (data: DataPoint[]): Anomaly[] => {
  return data
    .filter(point => point.isAnomaly)
    .map((point, idx) => ({
      id: `anomaly_${idx}`,
      timestamp: point.timestamp,
      value: point.value,
      feature: "Temperature",
      severity: Math.random() < 0.5 ? "medium" : "high",
      description: `Unexpected temperature spike detected`,
    }));
};

export function AnomalyDetectionFeature() {
  const [selectedDevice, setSelectedDevice] = useState<string>("device_001");
  const [selectedFeature, setSelectedFeature] = useState<string>("Temperature");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("24h");
  const [loading, setLoading] = useState(false);
  const [anomalyData, setAnomalyData] = useState<AnomalyDataPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch anomaly data from API
  useEffect(() => {
    const fetchAnomalies = async () => {
      setLoading(true);
      setError(null);
      try {
        const rangeMap: { [key: string]: string } = {
          "1h": "-1h",
          "6h": "-6h",
          "24h": "-24h",
          "7d": "-7d",
        };
        
        const response = await checkAnomaly(selectedDevice, selectedFeature, {
          range_start: rangeMap[selectedTimeRange] || "-24h",
          training_range: "-24h",
          latest: false,
          dedup: true,
        });
        
        setAnomalyData(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch anomaly data";
        setError(errorMessage);
        message.error(`Failed to fetch anomaly data: ${errorMessage}`);
        // Fall back to mock data
        setAnomalyData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, [selectedDevice, selectedFeature, selectedTimeRange]);

  // Use API data if available, otherwise use mock data
  const chartData = useMemo(() => {
    if (anomalyData) {
      return convertAnomalyDataToChartData(anomalyData);
    }
    return generateMockData();
  }, [anomalyData]);

  const anomalies = useMemo(() => {
    if (anomalyData) {
      return convertToAnomalies(anomalyData, selectedFeature);
    }
    return generateMockAnomalies(chartData);
  }, [anomalyData, selectedFeature, chartData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const values = chartData.map(d => d.value);
    const anomalyCount = chartData.filter(d => d.isAnomaly).length;
    
    return {
      current: values[values.length - 1],
      status: (anomalyCount > 5 ? "Critical" : "Normal") as "Critical" | "Normal",
      totalAnomalies: anomalyCount,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
    };
  }, [chartData]);

  return (
    <div>
      <ControlPanel
        selectedDevice={selectedDevice}
        selectedFeature={selectedFeature}
        selectedTimeRange={selectedTimeRange}
        onDeviceChange={setSelectedDevice}
        onFeatureChange={setSelectedFeature}
        onTimeRangeChange={setSelectedTimeRange}
      />

      <Spin spinning={loading} tip="Analyzing anomalies...">
        {error && <div style={{ color: "red", padding: "16px" }}>Error: {error}</div>}
        
        <SummaryCards
          status={stats.status}
          totalAnomalies={stats.totalAnomalies}
          minValue={stats.min}
          maxValue={stats.max}
          avgValue={parseFloat(stats.avg)}
          currentValue={stats.current}
        />

        <AnomalyChart
          data={chartData}
          anomalies={anomalies}
          feature={selectedFeature}
        />

        <AnomalyLog anomalies={anomalies} />
      </Spin>
    </div>
  );
}
