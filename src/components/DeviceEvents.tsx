import { useEffect, useState } from "react";
import { getModel, type Model } from "../api/modelApi";
import { formatFeatureName, formatName } from "../utils/formatting";
import { FeatureEventsTable } from "./FeatureEventsTable";
import { Card, Spin, Space, Typography, Descriptions } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export function DeviceEvents({ thingId }: { thingId: string }) {
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchModel = async () => {
      const data = await getModel(thingId);
      setModel(data);
      setLoading(false);
    };
    fetchModel();
  }, [thingId]);

  if (loading || !model) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Loading device data..." />
      </div>
    );
  }

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
        <Card
          style={{
            borderLeft: "4px solid #2C2803",
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Title level={3} style={{ margin: 0 }}>
              <DatabaseOutlined style={{ marginRight: 8 }} />
              {formatName(thingId)}
            </Title>
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Thing ID">
                <Text code>{thingId}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Space>
        </Card>

        {Object.entries(model.features).map(([name, featureData]) => (
          <FeatureEventsTable
            key={name}
            model={model}
            featureName={name}
            featureData={featureData}
          />
        ))}
      </Space>
    </div>
  );
}
