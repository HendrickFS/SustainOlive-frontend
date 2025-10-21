import { useEffect, useState } from "react";
import { getModels, type Model } from "../api/modelApi";
import { useNavigate } from "react-router-dom";
import { formatName } from "../utils/formatting";
import { List, Card, Typography, Space } from "antd";
import { RightOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export function DeviceList() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await getModels();
        setModels(data);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const handleRedirect = (thingId: string) => {
    navigate(`/device-data/${thingId}`);
  };

  return (
    <div
      style={{
        padding: "24px",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <Title level={2}>Device List</Title>
      
      <List
        loading={loading}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 5,
          xxl: 6,
        }}
        dataSource={models}
        renderItem={(model) => (
          <List.Item>
            <Card
              hoverable
              onClick={() => handleRedirect(model.thingId)}
              style={{
                borderLeft: "4px solid #2C2803",
                background: "linear-gradient(90deg, #f0f4ff, #ffffff)",
              }}
              bodyStyle={{
                padding: "16px",
                minHeight: "75px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Text
                  strong
                  style={{
                    fontSize: "16px",
                    color: "#1f2937",
                    display: "block",
                  }}
                  ellipsis={{ tooltip: formatName(model.thingId) }}
                >
                  {formatName(model.thingId)}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: "12px" }}
                >
                  <RightOutlined style={{ marginRight: 4 }} />
                  View Details
                </Text>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}
