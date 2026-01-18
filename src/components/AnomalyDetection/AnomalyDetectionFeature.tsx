import { useState, useMemo, useEffect } from "react";
import { ControlPanel } from "./ControlPanel";
import { SummaryCards } from "./SummaryCards";
import { AnomalyChart } from "./AnomalyChart";
import { AnomalyLog } from "./AnomalyLog";
import { checkAnomaly, type AnomalyDataPoint } from "../../api/historicalApi";
import { getModel, type Model } from "../../api/modelApi";
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

// Convert technical error messages to user-friendly messages
const getErrorMessage = (technicalError: string): string => {
  const lowerError = technicalError.toLowerCase();
  
  if (lowerError.includes("insufficient training data")) {
    return "Not enough historical data available. Please ensure at least 10 data points exist in the 24-hour training period.";
  }
  
  if (lowerError.includes("no data found")) {
    return "No data found for the selected device and feature in the specified time range. Please try a different time range.";
  }
  
  if (lowerError.includes("connection") || lowerError.includes("timeout")) {
    return "Unable to connect to the data source. Please check your network connection and try again.";
  }
  
  if (lowerError.includes("invalid") || lowerError.includes("not found")) {
    return "Invalid device or feature selection. Please verify your selections and try again.";
  }
  
  if (lowerError.includes("permission") || lowerError.includes("unauthorized")) {
    return "You don't have permission to access this data. Please contact your administrator.";
  }
  
  // Return a generic message if we can't map the error
  return "An error occurred while analyzing anomalies. Please try again or contact support if the problem persists.";
};

export function AnomalyDetectionFeature() {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("24h");
  const [loading, setLoading] = useState(false);
  const [anomalyData, setAnomalyData] = useState<AnomalyDataPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelLimits, setModelLimits] = useState<{ min?: number; max?: number }>({});

  // Fetch model limits when device/feature changes
  useEffect(() => {
    const fetchModelLimits = async () => {
      if (!selectedDevice || !selectedFeature) return;
      
      try {
        const model: Model = await getModel(selectedDevice);
        const featureData = model.features[selectedFeature];
        
        if (featureData?.properties) {
          setModelLimits({
            min: featureData.properties.minValue,
            max: featureData.properties.maxValue,
          });
        } else {
          setModelLimits({});
        }
      } catch (err) {
        console.error("Failed to fetch model limits:", err);
        setModelLimits({});
      }
    };
    
    fetchModelLimits();
  }, [selectedDevice, selectedFeature]);

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
      } catch (err: any) {
        let errorMessage = "Failed to fetch anomaly data";
        
        // Parse error response
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        // Convert technical errors to user-friendly messages
        const userFriendlyError = getErrorMessage(errorMessage);
        
        setError(userFriendlyError);
        message.error(userFriendlyError);
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
    return [];
  }, [anomalyData]);

  const anomalies = useMemo(() => {
    if (anomalyData) {
      return convertToAnomalies(anomalyData, selectedFeature);
    }
    return [];
  }, [anomalyData, selectedFeature]);

  // Calculate statistics
  const stats = useMemo(() => {
    const values = chartData.map((d: DataPoint) => d.value);
    const anomalyCount = chartData.filter((d: DataPoint) => d.isAnomaly).length;
    
    return {
      current: values[values.length - 1],
      status: (anomalyCount > 5 ? "Critical" : "Normal") as "Critical" | "Normal",
      totalAnomalies: anomalyCount,
      min: modelLimits.min !== undefined ? modelLimits.min : Math.min(...values),
      max: modelLimits.max !== undefined ? modelLimits.max : Math.max(...values),
      avg: (values.reduce((a: number, b: number) => a + b, 0) / values.length).toFixed(2),
    };
  }, [chartData, modelLimits]);

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
        {error && (
          <div
            style={{
              color: "#ff4d4f",
              padding: "16px",
              marginBottom: "16px",
              backgroundColor: "#fff2f0",
              border: "1px solid #ffccc7",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}
        
        {!error && (
          <>
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
          </>
        )}
      </Spin>
    </div>
  );
}
