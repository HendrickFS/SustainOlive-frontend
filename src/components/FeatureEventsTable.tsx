import { useEffect, useState } from "react";
import type { Model } from "../api/modelApi";
import { getHistoricalData } from "../api/historicalApi";
import {
  formatFeatureName,
  formatTimestamp,
} from "../utils/formatting";
import { Card, Table, Tag, Typography, Empty } from "antd";
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

interface EventTableData {
  key: number;
  featureName: string;
  value: string;
  minValue: string;
  maxValue: string;
  event: string;
  eventTime: string;
  backgroundColor: string;
  eventStatus: "Critical" | "Non-Critical";
}

function getEvents(
  data: HistoricalEntry[],
  model: Model,
  feature: string
): Event[] {
  if (!data || data.length === 0) {
    return [];
  }

  let events: Event[] = [];
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
      events.push({
        time: data[i + 1].time,
        value: data[i + 1].value,
        from: auxStatus,
        to: status,
      });
    }
    status = auxStatus;
  }

  return events;
}

export function FeatureEventsTable({
  model,
  featureName,
  featureData,
  range,
}: {
  model: Model;
  featureName: string;
  featureData: any;
  range: string;
}) {
  const [data, setData] = useState<HistoricalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const historicalData = await getHistoricalData(
          model.thingId,
          featureName,
          range
        );
        setData(historicalData);
      } catch (error) {
        console.error("Error fetching historical data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [model, featureName, range]);

  const events = getEvents(data, model, featureName);

  const getTableColumns = (): ColumnsType<EventTableData> => [
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

  const convertEventsToTableData = (): EventTableData[] => {
    return events.map((event, index) => {
      const backgroundColor =
        event.to === "Non-Critical" ? "#d4edda" : "#f8d7da";
      const eventStatus: "Critical" | "Non-Critical" =
        event.to === "Non-Critical" ? "Non-Critical" : "Critical";

      return {
        key: index,
        featureName: formatFeatureName(featureName),
        value: !event.error
          ? `${event.value}${featureData.properties?.unit || ""}`
          : "-",
        minValue:
          featureData.properties?.minValue !== undefined
            ? `${featureData.properties.minValue}${
                featureData.properties?.unit
                  ? " " + featureData.properties.unit
                  : ""
              }`
            : "-",
        maxValue:
          featureData.properties?.maxValue !== undefined
            ? `${featureData.properties.maxValue}${
                featureData.properties?.unit
                  ? " " + featureData.properties.unit
                  : ""
              }`
            : "-",
        event:
          event.to === "Non-Critical"
            ? "Becomes Non-Critical"
            : "Becomes Critical",
        eventTime: !event.error ? formatTimestamp(event.time) : "-",
        backgroundColor,
        eventStatus,
      };
    });
  };

  return (
    <Card
      title={
        <Title level={5} style={{ margin: 0, fontFamily: "Inter, sans-serif" }}>
          {formatFeatureName(featureName)}
        </Title>
      }
    >
      <Table
        columns={getTableColumns()}
        dataSource={convertEventsToTableData()}
        loading={loading}
        pagination={false}
        size="small"
        bordered
        locale={{
          emptyText: (
            <Empty
              description={`No events found for ${formatFeatureName(
                featureName
              )}`}
            />
          ),
        }}
      />
    </Card>
  );
}
