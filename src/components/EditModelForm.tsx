import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Model } from "../api/modelApi";
import { getModel, updateModel } from "../api/modelApi";
import { getType, capitalize } from "../utils/formatting";
import { FeaturesTypes } from "../utils/dittoModelUtils";
import {
  Alert,
  Button,
  Card,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Select,
  Space,
  Tag,
  Typography,
  Popconfirm,
  message,
  Spin,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const DefaultFeatureValues: Record<string, any> = {
  Boolean: false,
  Number: 0,
  String: "",
  Date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
  Array: [],
};

interface Feature {
  name: string;
  type: string;
  value: any;
  minValue?: number | null;
  maxValue?: number | null;
  unit: string;
  timestamp: string;
}

export function EditModelForm() {
  const { thingId } = useParams<{ thingId: string }>();
  const navigate = useNavigate();

  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [modelType, setModelType] = useState<string>(thingId ? getType(thingId) : "");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [newFeature, setNewFeature] = useState<Feature>({
    name: "",
    type: FeaturesTypes[0],
    value: "",
    minValue: 0,
    maxValue: 0,
    unit: "",
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    const load = async () => {
      if (!thingId) {
        setLoading(false);
        return;
      }
      try {
        const m = await getModel(thingId);
        setModel(m);
        setModelType(getType(m.thingId));
        const featuresArray: Feature[] = Object.entries(m.features).map(
          ([featureName, featureData]: [string, any]) => {
            const rawVal = featureData?.properties?.value;
            const isArrayVal = Array.isArray(rawVal);
            const valueType = isArrayVal ? "Array" : capitalize(typeof rawVal);
            return {
              name: featureName,
              type: valueType,
              value: rawVal ?? DefaultFeatureValues[typeof rawVal],
              minValue: featureData?.properties?.minValue ?? null,
              maxValue: featureData?.properties?.maxValue ?? null,
              unit: featureData?.properties?.unit ?? "",
              timestamp: featureData?.properties?.timestamp ?? new Date().toISOString(),
            } as Feature;
          }
        );
        setFeatures(featuresArray);
      } catch (err) {
        console.error("Failed to load model", err);
        message.error("Failed to load model data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [thingId]);

  const handleAddFeature = () => {
    if (!newFeature.name.trim()) {
      message.warning("Please provide a feature name");
      return;
    }
    setFeatures((prev) => [...prev, newFeature]);
    setNewFeature({
      name: "",
      type: FeaturesTypes[0],
      value: "",
      minValue: 0,
      maxValue: 0,
      unit: "",
      timestamp: new Date().toISOString(),
    });
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!thingId) {
      message.error("Missing thingId");
      return;
    }
    if (!model) {
      message.error("Model not loaded yet");
      return;
    }
    setSaving(true);
    const newModel: Model = {
      thingId,
      policyId: "olive.default:policy",
      features: features.reduce((acc, feature) => {
        if (!Object.prototype.hasOwnProperty.call(model.features, feature.name)) {
          if (feature.type === "Number") {
            acc[feature.name] = {
              properties: {
                value: feature.value,
                minValue: feature.minValue,
                maxValue: feature.maxValue,
                unit: feature.unit,
                timestamp: new Date().toISOString(),
              },
            };
          } else {
            acc[feature.name] = {
              properties: {
                value: feature.value,
              },
            };
          }
        } else {
          acc[feature.name] = (model as any).features[feature.name];
        }
        return acc;
      }, {} as Record<string, any>),
    } as Model;

    try {
      await updateModel(newModel);
      message.success("Model updated successfully");
      navigate("/models");
    } catch (error) {
      console.error("Error saving model:", error);
      message.error("Failed to save model");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        padding: 24,
        maxWidth: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "#fafafa",
      }}
    >
      <div style={{ width: "50%", minWidth: 360, maxWidth: 960 }}>
        <Typography.Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          Editing Model
        </Typography.Title>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Spin tip="Loading model..." />
          </div>
        ) : !thingId ? (
          <Alert type="error" message="No ThingId provided" showIcon />
        ) : (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card title="General">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Form layout="vertical">
                  <Form.Item label="Model type">
                    <Input value={modelType} disabled onChange={(e) => setModelType(e.target.value)} />
                  </Form.Item>
                  <Form.Item label="ThingId">
                    <Input value={thingId} disabled />
                  </Form.Item>
                </Form>
              </Space>
            </Card>

            <Card title="Features">
              {features.length === 0 ? (
                <Empty description="No features added yet" />
              ) : (
                <List
                  dataSource={features}
                  renderItem={(feature, index) => (
                    <List.Item
                      actions={[
                        <Popconfirm
                          key="delete"
                          title="Remove this feature?"
                          okText="Remove"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => handleRemoveFeature(index)}
                        >
                          <Button danger type="text" icon={<DeleteOutlined />} />
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Typography.Text strong>{feature.name}</Typography.Text>
                            <Tag>{feature.type}</Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}

              <Divider style={{ margin: "16px 0" }} />
              <Typography.Text strong>New feature</Typography.Text>
              <Form layout="vertical" style={{ marginTop: 12 }}>
                <Space wrap style={{ width: "100%" }}>
                  <Form.Item label="Name" style={{ minWidth: 200, flex: 1 }}>
                    <Input
                      placeholder='e.g., "Temperature"'
                      value={newFeature.name}
                      onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                    />
                  </Form.Item>
                  <Form.Item label="Type" style={{ minWidth: 160 }}>
                    <Select
                      value={newFeature.type}
                      onChange={(val) => setNewFeature({ ...newFeature, type: val })}
                      options={FeaturesTypes.map((t) => ({ label: t, value: t }))}
                      style={{ minWidth: 160 }}
                    />
                  </Form.Item>
                  <Form.Item label=" ">
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFeature}>
                      Add
                    </Button>
                  </Form.Item>
                </Space>

                {newFeature.type === "Number" && (
                  <Space wrap style={{ width: "100%" }}>
                    <Form.Item label="Minimum Value" style={{ minWidth: 160 }}>
                      <InputNumber
                        style={{ width: 160 }}
                        value={newFeature.minValue ?? 0}
                        onChange={(val) => setNewFeature({ ...newFeature, minValue: Number(val ?? 0) })}
                      />
                    </Form.Item>
                    <Form.Item label="Maximum Value" style={{ minWidth: 160 }}>
                      <InputNumber
                        style={{ width: 160 }}
                        value={newFeature.maxValue ?? 0}
                        onChange={(val) => setNewFeature({ ...newFeature, maxValue: Number(val ?? 0) })}
                      />
                    </Form.Item>
                    <Form.Item label="Unit" style={{ minWidth: 160 }}>
                      <Input
                        style={{ width: 160 }}
                        placeholder='e.g., "°C", "L", "%"'
                        value={newFeature.unit}
                        onChange={(e) => setNewFeature({ ...newFeature, unit: e.target.value })}
                      />
                    </Form.Item>
                  </Space>
                )}
              </Form>
            </Card>

            <Space style={{ width: "100%", justifyContent: "center" }}>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} disabled={saving}>
                Cancel
              </Button>
              <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
                Save
              </Button>
            </Space>
          </Space>
        )}
      </div>
    </div>
  );
}
