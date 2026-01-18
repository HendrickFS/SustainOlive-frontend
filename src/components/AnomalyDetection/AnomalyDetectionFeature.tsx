import { useState, useMemo } from "react";
import { ControlPanel } from "./ControlPanel";
import { SummaryCards } from "./SummaryCards";
import { AnomalyChart } from "./AnomalyChart";
import { AnomalyLog } from "./AnomalyLog";

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

// Mock data generator
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

  // Mock data
  const mockData = useMemo(() => generateMockData(), []);
  const mockAnomalies = useMemo(() => generateMockAnomalies(mockData), [mockData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const values = mockData.map(d => d.value);
    const anomalyCount = mockData.filter(d => d.isAnomaly).length;
    
    return {
      current: values[values.length - 1],
      status: (anomalyCount > 5 ? "Critical" : "Normal") as "Critical" | "Normal",
      totalAnomalies: anomalyCount,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
    };
  }, [mockData]);

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

      <SummaryCards
        status={stats.status}
        totalAnomalies={stats.totalAnomalies}
        minValue={stats.min}
        maxValue={stats.max}
        avgValue={parseFloat(stats.avg)}
        currentValue={stats.current}
      />

      <AnomalyChart
        data={mockData}
        anomalies={mockAnomalies}
        feature={selectedFeature}
      />

      <AnomalyLog anomalies={mockAnomalies} />
    </div>
  );
}
