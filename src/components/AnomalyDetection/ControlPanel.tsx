import { Select, Row, Col, Card } from "antd";
import { useState, useEffect } from "react";
import { getModels, type Model } from "../../api/modelApi";

interface ControlPanelProps {
  selectedDevice: string;
  selectedFeature: string;
  selectedTimeRange: string;
  onDeviceChange: (value: string) => void;
  onFeatureChange: (value: string) => void;
  onTimeRangeChange: (value: string) => void;
}

export function ControlPanel({
  selectedDevice,
  selectedFeature,
  selectedTimeRange,
  onDeviceChange,
  onFeatureChange,
  onTimeRangeChange,
}: ControlPanelProps) {
  const [devices, setDevices] = useState<{ value: string; label: string }[]>([]);
  const [features, setFeatures] = useState<{ value: string; label: string }[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingFeatures, setLoadingFeatures] = useState(false);

  // Fetch devices on mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const models = await getModels();
        const deviceOptions = models.map((model: Model) => ({
          value: model.thingId,
          label: model.thingId,
        }));
        setDevices(deviceOptions);
        // Set first device as default if not already set
        if (deviceOptions.length > 0 && !selectedDevice) {
          onDeviceChange(deviceOptions[0].value);
        }
      } catch (error) {
        console.error("Failed to fetch devices:", error);
      } finally {
        setLoadingDevices(false);
      }
    };
    fetchDevices();
  }, []);

  // Fetch features when device changes
  useEffect(() => {
    const fetchFeatures = async () => {
      if (!selectedDevice) return;
      
      setLoadingFeatures(true);
      try {
        const models = await getModels();
        const selectedModel = models.find((m: Model) => m.thingId === selectedDevice);
        
        if (selectedModel && selectedModel.features) {
          const featureOptions = Object.keys(selectedModel.features).map(
            (featureName: string) => ({
              value: featureName,
              label: featureName,
            })
          );
          setFeatures(featureOptions);
          // Set first feature as default if not already set
          if (featureOptions.length > 0 && !selectedFeature) {
            onFeatureChange(featureOptions[0].value);
          }
        }
      } catch (error) {
        console.error("Failed to fetch features:", error);
      } finally {
        setLoadingFeatures(false);
      }
    };
    fetchFeatures();
  }, [selectedDevice]);

  const timeRanges = [
    { value: "1h", label: "Last 1 Hour" },
    { value: "6h", label: "Last 6 Hours" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
  ];

  return (
    <Card
      style={{
        marginBottom: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
            Device
          </div>
          <Select
            style={{ width: "100%" }}
            value={selectedDevice}
            onChange={onDeviceChange}
            options={devices}
            placeholder="Select a device"
            loading={loadingDevices}
            disabled={loadingDevices}
          />
        </Col>

        <Col xs={24} sm={12} md={8}>
          <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
            Feature
          </div>
          <Select
            style={{ width: "100%" }}
            value={selectedFeature}
            onChange={onFeatureChange}
            options={features}
            placeholder="Select a feature"
            loading={loadingFeatures}
            disabled={loadingFeatures || features.length === 0}
          />
        </Col>

        <Col xs={24} sm={12} md={8}>
          <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
            Time Range
          </div>
          <Select
            style={{ width: "100%" }}
            value={selectedTimeRange}
            onChange={onTimeRangeChange}
            options={timeRanges}
            placeholder="Select time range"
          />
        </Col>
      </Row>
    </Card>
  );
}
