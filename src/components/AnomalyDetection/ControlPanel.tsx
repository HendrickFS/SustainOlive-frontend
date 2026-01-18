import { Select, Row, Col, Card } from "antd";

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
  // TODO: Fetch devices from backend API
  const devices = [
    { value: "device_001", label: "Device 001 - Greenhouse A" },
    { value: "device_002", label: "Device 002 - Greenhouse B" },
    { value: "device_003", label: "Device 003 - Outdoor Plot" },
  ];

  // TODO: Fetch features from backend API based on selected device
  const features = [
    { value: "Temperature", label: "Temperature (°C)" },
    { value: "Humidity", label: "Humidity (%)" },
    { value: "Soil Moisture", label: "Soil Moisture (m³/m³)" },
    { value: "Light Intensity", label: "Light Intensity (lux)" },
  ];

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
