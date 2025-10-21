import { useEffect, useState } from "react";
import { getModels, type Model } from "../api/modelApi";
import { useNavigate } from "react-router-dom";
import {
  formatName,
  formatFeatureName,
  formatTimestamp,
} from "../utils/formatting";
import { Button, Card, Space, Table, Tag, Typography } from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

interface FeatureData {
  featureName: string;
  value: any;
  minValue?: number;
  maxValue?: number;
  unit?: string;
  status: "Critical" | "Non-Critical" | "Unknown";
  timestamp?: string;
  backgroundColor: string;
}

function isValueCritical(value: any, min?: number, max?: number): boolean {
  const checkOne = (v: any) => {
    const n = Number(v);
    if (Number.isNaN(n)) return false;
    if (min != null && n < Number(min)) return true;
    if (max != null && n > Number(max)) return true;
    return false;
  };

  if (Array.isArray(value)) return value.some(checkOne);
  return checkOne(value);
}

function isModelCritical(model: Model): boolean {
  const features = model.features ?? {};
  return Object.values(features as any).some((data: any) => {
    const value = data?.properties?.value;
    if (value == null) return false;

    const min = data?.properties?.minValue;
    const max = data?.properties?.maxValue;

    return isValueCritical(value, min, max);
  });
}

export function ModelsData() {
  const [loading, setLoading] = useState<boolean>(true);
  const [models, setModels] = useState<Model[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [filteredModels, setFilteredModels] = useState<Model[]>(models);

  const navigate = useNavigate();

  const refreshModels = () => {
    getModels()
      .then((data) => {
        setModels(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching models:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    getModels()
      .then((data) => {
        setModels(data);
        setFilteredModels(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching models:", error);
        setLoading(false);
      });
  }, []);

  const getTableColumns = (): ColumnsType<FeatureData> => [
    {
      title: "Feature",
      dataIndex: "featureName",
      key: "featureName",
      width: "20%",
      onCell: (record) => ({
        style: { backgroundColor: record.backgroundColor },
      }),
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: "20%",
      render: (value, record) => {
        const displayValue = Array.isArray(value)
          ? value.join(", ")
          : value !== undefined
          ? `${value}${record.unit ? " " + record.unit : ""}`
          : "-";
        return displayValue;
      },
      onCell: (record) => ({
        style: { backgroundColor: record.backgroundColor },
      }),
    },
    {
      title: "Minimum Value",
      dataIndex: "minValue",
      key: "minValue",
      width: "15%",
      render: (minValue, record) =>
        minValue !== undefined
          ? `${minValue}${record.unit ? " " + record.unit : ""}`
          : "-",
      onCell: (record) => ({
        style: { backgroundColor: record.backgroundColor },
      }),
    },
    {
      title: "Maximum Value",
      dataIndex: "maxValue",
      key: "maxValue",
      width: "15%",
      render: (maxValue, record) =>
        maxValue !== undefined
          ? `${maxValue}${record.unit ? " " + record.unit : ""}`
          : "-",
      onCell: (record) => ({
        style: { backgroundColor: record.backgroundColor },
      }),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status: string) => {
        if (status === "Critical") {
          return <Tag color="error">Critical</Tag>;
        } else if (status === "Non-Critical") {
          return <Tag color="success">Non-Critical</Tag>;
        }
        return "-";
      },
      onCell: (record) => ({
        style: { backgroundColor: record.backgroundColor },
      }),
    },
    {
      title: "Update Time",
      dataIndex: "timestamp",
      key: "timestamp",
      width: "15%",
      render: (timestamp) => (timestamp ? formatTimestamp(timestamp) : "Unknown"),
      onCell: (record) => ({
        style: { backgroundColor: record.backgroundColor },
      }),
    },
  ];

  const convertModelToTableData = (model: Model): FeatureData[] => {
    return Object.entries(model.features).map(([name, data]: [string, any]) => {
      const value = data.properties?.value;
      const minValue = data.properties?.minValue;
      const maxValue = data.properties?.maxValue;
      
      const isCritical = minValue != null && maxValue != null
        ? isValueCritical(value, minValue, maxValue)
        : false;
      
      const backgroundColor =
        minValue != null && maxValue != null
          ? isCritical
            ? "#f8d7da"
            : "#d4edda"
          : "#fff";

      const status: "Critical" | "Non-Critical" | "Unknown" =
        minValue != null && maxValue != null
          ? isCritical
            ? "Critical"
            : "Non-Critical"
          : "Unknown";

      return {
        featureName: formatFeatureName(name),
        value,
        minValue,
        maxValue,
        unit: data.properties?.unit,
        status,
        timestamp: data.properties?.timestamp,
        backgroundColor,
      };
    });
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "#dfdfdfff",
        padding: "24px",
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <Button
              type={filter === "All" ? "primary" : "default"}
              onClick={() => {
                setFilter("All");
                setFilteredModels(models);
              }}
              style={
                filter === "All"
                  ? { backgroundColor: "#2C2803", borderColor: "#2C2803" }
                  : { color: "#2C2803", borderColor: "#2C2803" }
              }
            >
              All
            </Button>
            <Button
              type={filter === "Critical" ? "primary" : "default"}
              onClick={() => {
                setFilter("Critical");
                setFilteredModels(models.filter(isModelCritical));
              }}
              style={
                filter === "Critical"
                  ? { backgroundColor: "#2C2803", borderColor: "#2C2803" }
                  : { color: "#2C2803", borderColor: "#2C2803" }
              }
            >
              Critical
            </Button>
            <Button
              type={filter === "Non-Critical" ? "primary" : "default"}
              onClick={() => {
                setFilter("Non-Critical");
                setFilteredModels(
                  models.filter((model) => !isModelCritical(model))
                );
              }}
              style={
                filter === "Non-Critical"
                  ? { backgroundColor: "#2C2803", borderColor: "#2C2803" }
                  : { color: "#2C2803", borderColor: "#2C2803" }
              }
            >
              Non-Critical
            </Button>
          </Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshModels}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {filteredModels.map((model) => (
          <Card
            key={model.thingId}
            title={
              <Title level={4} style={{ margin: 0, fontFamily: "Inter, sans-serif" }}>
                {formatName(model.thingId)}
              </Title>
            }
            extra={
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/device-data/${model.thingId}`)}
                style={{ color: "#2196F3", borderColor: "#2196F3" }}
              >
                View Data Log
              </Button>
            }
          >
            <Table
              columns={getTableColumns()}
              dataSource={convertModelToTableData(model)}
              rowKey="featureName"
              pagination={false}
              size="small"
              bordered
            />
          </Card>
        ))}
      </Space>
    </div>
  );
}
