import { use, useEffect, useState } from "react";
import { getHistoricalData } from "../api/historicalApi";
import { getModels, type Model } from "../api/modelApi";
import {
  formatFeatureName,
  formatName,
  formatTimestamp,
} from "../utils/formatting";
import { useNavigate } from "react-router-dom";
import { Card, Button, Table, Tag, Space, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

interface HistoricalEntry {
  time: string;
  value: number;
}

interface Event {
  time: string;
  value: number;
  from: string;
  to: string;
  error?: boolean;
}

interface FeatureEventData {
  featureName: string;
  value: string;
  minValue: string;
  maxValue: string;
  event: string;
  eventTime: string;
  backgroundColor: string;
  eventStatus: "Critical" | "Non-Critical" | "Unknown";
}

async function fetchHistoricalData(
  model: Model,
  feature: string
): Promise<HistoricalEntry[]> {
  try {
    const historicalData = await getHistoricalData(model.thingId, feature, "-7d");
    return historicalData;
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return [];
  }
}

function getLastEvent(
  data: HistoricalEntry[],
  model: Model,
  feature: string
): Event {
  if (!data || data.length === 0) {
    return {
      from: "Non-Critical",
      to: "Non-Critical",
      time: new Date().toISOString(),
      value: 0,
      error: true,
    };
  }

  let status =
    data[data.length - 1].value > model.features[feature].properties.minValue &&
    data[data.length - 1].value < model.features[feature].properties.maxValue
      ? "Non-Critical"
      : "Critical";

  for (let i = data.length - 1; i >= 0; i--) {
    const auxStatus =
      data[i].value > model.features[feature].properties.minValue &&
      data[i].value < model.features[feature].properties.maxValue
        ? "Non-Critical"
        : "Critical";

    if (auxStatus !== status) {
      return {
        time: data[i + 1].time,
        value: data[i + 1].value,
        from: auxStatus,
        to: status,
      };
    }
    status = auxStatus;
  }

  return {
    from: status,
    to: status,
    time: data[0].time,
    value: data[0].value,
  };
}

export function AllEventsList() {
  const [models, setModels] = useState<Model[]>([]);
  const [modelEvents, setModelEvents] = useState<
    Record<string, FeatureEventData[]>
  >({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchModelsAndEvents = async () => {
      setLoading(true);
      const fetchedModels = await getModels();
      setModels(fetchedModels);

      // Fetch events for all models
      const eventsMap: Record<string, FeatureEventData[]> = {};
      
      for (const model of fetchedModels) {
        const featureEvents: FeatureEventData[] = [];
        
        for (const [featureName, featureData] of Object.entries(model.features)) {
          const historicalData = await fetchHistoricalData(model, featureName);
          const event = getLastEvent(historicalData, model, featureName);
          
          const backgroundColor = !event.error
            ? event.to === "Critical"
              ? "#f8d7da"
              : "#d4edda"
            : "#fff";

          const eventStatus: "Critical" | "Non-Critical" | "Unknown" = !event.error
            ? event.to === "Critical"
              ? "Critical"
              : "Non-Critical"
            : "Unknown";

          featureEvents.push({
            featureName: formatFeatureName(featureName),
            value: !event.error
              ? `${event.value}${(featureData as any).properties?.unit || ""}`
              : "-",
            minValue:
              (featureData as any).properties?.minValue !== undefined
                ? `${(featureData as any).properties.minValue}${
                    (featureData as any).properties?.unit
                      ? " " + (featureData as any).properties.unit
                      : ""
                  }`
                : "-",
            maxValue:
              (featureData as any).properties?.maxValue !== undefined
                ? `${(featureData as any).properties.maxValue}${
                    (featureData as any).properties?.unit
                      ? " " + (featureData as any).properties.unit
                      : ""
                  }`
                : "-",
            event:
              backgroundColor === "#d4edda"
                ? "Becomes Non-Critical"
                : backgroundColor === "#f8d7da"
                ? "Becomes Critical"
                : "-",
            eventTime: !event.error ? formatTimestamp(event.time) : "-",
            backgroundColor,
            eventStatus,
          });
        }
        
        eventsMap[model.thingId] = featureEvents;
      }
      
      setModelEvents(eventsMap);
      setLoading(false);
    };

    fetchModelsAndEvents();
  }, []);

  const getTableColumns = (): ColumnsType<FeatureEventData> => [
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
      onCell: (record) => ({
        style: { backgroundColor: record.backgroundColor },
      }),
    },
    {
      title: "Minimum Value",
      dataIndex: "minValue",
      key: "minValue",
      width: "15%",
      onCell: (record) => ({
        style: { backgroundColor: record.backgroundColor },
      }),
    },
    {
      title: "Maximum Value",
      dataIndex: "maxValue",
      key: "maxValue",
      width: "15%",
      onCell: (record) => ({
        style: { backgroundColor: record.backgroundColor },
      }),
    },
    {
      title: "Event",
      dataIndex: "event",
      key: "event",
      width: "15%",
      render: (event: string, record) => {
        if (record.eventStatus === "Critical") {
          return <Tag color="error">{event}</Tag>;
        } else if (record.eventStatus === "Non-Critical") {
          return <Tag color="success">{event}</Tag>;
        }
        return event;
      },
      onCell: (record) => ({
        style: { backgroundColor: record.backgroundColor },
      }),
    },
    {
      title: "Event Time",
      dataIndex: "eventTime",
      key: "eventTime",
      width: "15%",
      onCell: (record) => ({
        style: { backgroundColor: record.backgroundColor },
      }),
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflowY: "auto",
        padding: "24px",
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {models.map((model) => (
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
                onClick={() => navigate(`/device-events/${model.thingId}`)}
                style={{ color: "#2196F3", borderColor: "#2196F3" }}
              >
                View Device Events
              </Button>
            }
            loading={loading}
          >
            <Table
              columns={getTableColumns()}
              dataSource={modelEvents[model.thingId] || []}
              rowKey="featureName"
              pagination={false}
              size="small"
              bordered
              loading={loading}
            />
          </Card>
        ))}
      </Space>
    </div>
  );
}
