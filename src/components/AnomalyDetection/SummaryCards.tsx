import { Row, Col, Card, Statistic } from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";

interface SummaryCardsProps {
  status: "Normal" | "Critical";
  totalAnomalies: number;
  minValue: number;
  maxValue: number;
  avgValue: number;
  currentValue: number;
}

export function SummaryCards({
  status,
  totalAnomalies,
  minValue,
  maxValue,
  avgValue,
  currentValue,
}: SummaryCardsProps) {
  const statusColor = status === "Normal" ? "#52c41a" : "#ff4d4f";
  const statusIcon = status === "Normal" ? <CheckCircleOutlined /> : <WarningOutlined />;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
      <Col xs={24} sm={12} md={6}>
        <Card
          style={{
            borderRadius: "8px",
            borderLeft: `4px solid ${statusColor}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Statistic
            title="Current Status"
            value={status}
            prefix={statusIcon}
            valueStyle={{ color: statusColor, fontSize: "18px" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card
          style={{
            borderRadius: "8px",
            borderLeft: "4px solid #1890ff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Statistic
            title="Anomalies (Last 24h)"
            value={totalAnomalies}
            valueStyle={{ fontSize: "18px", color: "#1890ff" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card
          style={{
            borderRadius: "8px",
            borderLeft: "4px solid #faad14",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Statistic
            title="Current Value"
            value={currentValue}
            suffix="°C"
            precision={2}
            valueStyle={{ fontSize: "18px", color: "#faad14" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card
          style={{
            borderRadius: "8px",
            borderLeft: "4px solid #722ed1",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
              Value Range
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
              Min: {minValue.toFixed(2)}°C
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
              Max: {maxValue.toFixed(2)}°C
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#722ed1" }}>
              Avg: {avgValue.toFixed(2)}°C
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
