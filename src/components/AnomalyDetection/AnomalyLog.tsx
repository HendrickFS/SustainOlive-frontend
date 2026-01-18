import { useMemo } from "react";
import { Card, Table, Tag, Empty, Button, Space } from "antd";
import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";

interface Anomaly {
  id: string;
  timestamp: number;
  value: number;
  feature: string;
  severity: "low" | "medium" | "high";
  description: string;
}

interface AnomalyLogProps {
  anomalies: Anomaly[];
}

export function AnomalyLog({ anomalies }: AnomalyLogProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "yellow";
      default:
        return "blue";
    }
  };

  const columns: TableColumnsType<Anomaly> = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      width: "20%",
      render: (timestamp: number) => formatTimestamp(timestamp),
      sorter: (a, b) => a.timestamp - b.timestamp,
    },
    {
      title: "Feature",
      dataIndex: "feature",
      key: "feature",
      width: "15%",
      filters: [
        { text: "Temperature", value: "Temperature" },
        { text: "Humidity", value: "Humidity" },
        { text: "Soil Moisture", value: "Soil Moisture" },
        { text: "Light Intensity", value: "Light Intensity" },
      ],
      onFilter: (value, record) => record.feature === value,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: "12%",
      render: (value: number) => `${value.toFixed(2)}°C`,
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      width: "12%",
      render: (severity: "low" | "medium" | "high") => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Low", value: "low" },
        { text: "Medium", value: "medium" },
        { text: "High", value: "high" },
      ],
      onFilter: (value, record) => record.severity === value,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (description: string) => (
        <span style={{ fontSize: "13px", color: "#666" }}>{description}</span>
      ),
    },
  ];

  const dataSource = useMemo(
    () =>
      anomalies.map((anomaly) => ({
        ...anomaly,
        key: anomaly.id,
      })),
    [anomalies]
  );

  return (
    <Card
      title="Anomaly Log"
      extra={
        <Space>
          <Button
            onClick={() => {
              // TODO: Implement export to CSV
              console.log("Export all anomalies to CSV");
            }}
          >
            Export
          </Button>
        </Space>
      }
      style={{
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{
          pageSize: 10,
          total: anomalies.length,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total) => `Total ${total} anomalies`,
        }}
        locale={{
          emptyText: (
            <Empty
              description="No anomalies detected"
              style={{ paddingTop: "40px", paddingBottom: "40px" }}
            />
          ),
        }}
        size="small"
        scroll={{ x: true }}
      />
    </Card>
  );
}
