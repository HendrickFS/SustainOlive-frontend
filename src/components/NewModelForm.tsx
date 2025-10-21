import React from "react";
import { useNavigate } from "react-router-dom";
import type { Model } from "../api/modelApi";
import { postModel } from "../api/modelApi";
import { defaultPolicyId, FeaturesTypes } from "../utils/dittoModelUtils";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  List,
  Tag,
  Select,
  InputNumber,
  Typography,
  message,
  Popconfirm,
  Alert,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

type NewModelPageProps = {
  type?: string;
};

// (Removed unused DefaultFeatureValues)

interface Feature {
  name: string;
  type: string;
  value: any;
  minValue?: number | null;
  maxValue?: number | null;
  unit: string;
  timestamp: string;
}

export function NewModelForm({ type }: NewModelPageProps) {
  const [modelType, setModelType] = React.useState(type || "");
  const [features, setFeatures] = React.useState<Feature[]>([]);
  const [newFeature, setNewFeature] = React.useState<Feature>({
    name: "",
    type: FeaturesTypes[0],
    value: "",
    minValue: null,
    maxValue: null,
    unit: "",
    timestamp: new Date().toISOString(),
  });
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSave = async () => {
    if (!modelType.trim()) {
      message.error("Please enter a model type");
      return;
    }

    if (features.length === 0) {
      message.error("Please add at least one feature");
      return;
    }

    setLoading(true);
    const model: Model = {
      thingId: `olive.production:${
        modelType.toLowerCase().replace(/\s+/g, "-") + "001"
      }`,
      policyId: defaultPolicyId,
      features: features.reduce((acc, feature) => {
        if (feature.type == "Number") {
          acc[feature.name] = {
            properties: {
              value: feature.value,
              minValue: feature.minValue,
              maxValue: feature.maxValue,
              unit: feature.unit,
              timestamp: feature.timestamp,
            },
          };
        } else {
          acc[feature.name] = {
            properties: {
              value: feature.value,
              timestamp: feature.timestamp,
            },
          };
        }
        return acc;
      }, {} as Record<string, any>),
    };

    try {
      await postModel(model);
      message.success("Model created successfully!");
      navigate("/models");
    } catch (error) {
      console.error("Error saving model:", error);
      message.error("Failed to create model. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (!newFeature.name.trim()) {
      message.warning("Please enter a feature name");
      return;
    }

    setFeatures([...features, newFeature]);
    setNewFeature({
      name: "",
      type: FeaturesTypes[0],
      value: "",
      minValue: null,
      maxValue: null,
      unit: "",
      timestamp: new Date().toISOString(),
    });
    form.resetFields();
    message.success("Feature added successfully!");
  };

  const handleDeleteFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
    message.success("Feature deleted");
  };

  const generatedThingId = modelType
    ? `olive.production:${modelType.toLowerCase().replace(/\s+/g, "-")}001`
    : "";

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflowY: "auto",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "50%", minWidth: 480, maxWidth: 800, margin: "0 auto" }}>
        <Title level={2} style={{ textAlign: "center" }}>
          <PlusOutlined style={{ marginRight: 8 }} />
          New Model
        </Title>

        <Card title="Model Configuration">
          <Form form={form} layout="vertical">
            <Form.Item
              label="Model Type"
              required
              tooltip="Enter the type of model (e.g., Deposit, Mill, Bin)"
            >
              <Input
                size="large"
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                placeholder='e.g., "Deposit", "Mill", "Bin"...'
              />
            </Form.Item>

            {generatedThingId && (
              <Alert
                message="Generated Thing ID"
                description={
                  <Text code style={{ fontSize: 14 }}>
                    {generatedThingId}
                  </Text>
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ marginBottom: 16 }}
              />
            )}
          </Form>
        </Card>

        <Card title="Features">
          {features.length > 0 ? (
            <List
              dataSource={features}
              renderItem={(feature, index) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      title="Delete Feature"
                      description="Are you sure you want to delete this feature?"
                      onConfirm={() => handleDeleteFeature(index)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{feature.name}</Text>
                        <Tag color="blue">{feature.type}</Tag>
                        {feature.type === "Number" && feature.unit && (
                          <Tag color="green">{feature.unit}</Tag>
                        )}
                        {feature.type === "Number" &&
                          feature.minValue !== null &&
                          feature.maxValue !== null && (
                            <Tag color="orange">
                              Range: {feature.minValue} - {feature.maxValue}
                            </Tag>
                          )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Alert
              message="No features added yet"
              description="Add features using the form below"
              type="info"
              showIcon
            />
          )}
        </Card>

        <Card title="Add New Feature">
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Feature Name"
                  required
                  tooltip="Name of the feature (e.g., Temperature, Humidity)"
                >
                  <Input
                    value={newFeature.name}
                    onChange={(e) =>
                      setNewFeature({ ...newFeature, name: e.target.value })
                    }
                    placeholder='Feature name (e.g., "Temperature")'
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Feature Type" required>
                  <Select
                    value={newFeature.type}
                    onChange={(value) =>
                      setNewFeature({ ...newFeature, type: value })
                    }
                    style={{ width: "100%" }}
                  >
                    {FeaturesTypes.map((featureType) => (
                      <Select.Option key={featureType} value={featureType}>
                        {featureType}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {newFeature.type === "Number" && (
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item label="Minimum Value" tooltip="Optional minimum threshold value">
                    <InputNumber
                      style={{ width: "100%" }}
                      value={newFeature.minValue}
                      onChange={(value) =>
                        setNewFeature({
                          ...newFeature,
                          minValue: value,
                        })
                      }
                      placeholder="Minimum Value"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Maximum Value" tooltip="Optional maximum threshold value">
                    <InputNumber
                      style={{ width: "100%" }}
                      value={newFeature.maxValue}
                      onChange={(value) =>
                        setNewFeature({
                          ...newFeature,
                          maxValue: value,
                        })
                      }
                      placeholder="Maximum Value"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Unit" tooltip='Unit of measurement (e.g., "°C", "L", "%")'>
                    <Input
                      value={newFeature.unit}
                      onChange={(e) =>
                        setNewFeature({ ...newFeature, unit: e.target.value })
                      }
                      placeholder='Unit (e.g., "°C", "L", "%")'
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Form.Item>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddFeature}
                block
              >
                Add Feature
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Space style={{ width: "100%", justifyContent: "center", gap: 12 }}>
            <Button
              size="large"
              icon={<CloseOutlined />}
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              Save Model
            </Button>
          </Space>
        </Card>
      </Space>
    </div>
  );
}
