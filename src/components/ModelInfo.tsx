import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { getModel } from "../api/modelApi";
import type { Model } from "../api/modelApi";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { TextLabel } from "./TextLabel";
import { getType } from "../utils/formatting";
import { Card, Row, Col, Typography, Tag, Space, Divider, Spin, List, Alert } from "antd";
import { ApiOutlined, CodeOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const available3DModels = ["deposit"];

function getModelPath(thingId: string): string {
  const name = getType(thingId);
  if (available3DModels.includes(name)) {
    return `/${name}/${name}.gltf`;
  }
  return "/questionMarkModel/scene.gltf"; // Default model path
}

function ModelViewer({ url }: { url: string }) {
  const groupRef = useRef<Group>(null);

  try {
    const { scene } = useGLTF(url);
    const clonedScene = useMemo(() => clone(scene), [scene]);

    useFrame(() => {
      if (groupRef.current) {
        groupRef.current.rotation.y += 0.01;
      }
    });

    return (
      <group ref={groupRef}>
        <primitive object={clonedScene} scale={0.75} position={[0, 0, 0]} />
      </group>
    );
  } catch (err) {
    console.error("Erro ao carregar modelo 3D:", err);
    return (
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }
}

interface ModelInfoProps {
  thingId: string;
}

interface Feature {
  name: string;
  type: string;
  value: any;
}

export function ModelInfo({ thingId }: ModelInfoProps) {
  useGLTF.preload("/questionMarkModel/scene.gltf");
  useGLTF.preload("/deposits/deposit.gltf");

  const [modelType, setModelType] = React.useState(
    getType(thingId) || ""
  );
  const [features, setFeatures] = React.useState<Feature[]>([]);
  useEffect(() => {
    if (thingId) {
      getModel(thingId).then((model: Model) => {
        setModelType(getType(model.thingId));
        const featuresArray = Object.entries(model.features).map(
          ([featureName, featureData]: [string, any]) => ({
            name: featureName,
            type:
              capitalize(typeof featureData.properties.value) === "Object" &&
              Array.isArray(featureData.properties.value)
                ? "Array"
                : capitalize(typeof featureData.properties.value),
            value: featureData.properties.value,
          })
        );

        setFeatures(featuresArray);
      });
    }
  }, [thingId]);

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
        <Title level={2}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          {capitalize(modelType)} Model Information
        </Title>

        <Row gutter={24}>
          {/* Left Column - 3D Model and Features */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* 3D Model Viewer Card */}
              <Card title="3D Model Viewer">
                <div
                  style={{
                    width: "100%",
                    height: "400px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Suspense fallback={<Spin size="large" tip="Loading 3D model..." />}>
                    <Canvas
                      camera={{ position: [0, 0, 3] }}
                      style={{ width: "100%", height: "400px" }}
                    >
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[5, 5, 5]} intensity={3} />
                      <directionalLight position={[-5, 5, -5]} intensity={3} />
                      <directionalLight position={[5, 5, -5]} intensity={3} />
                      <directionalLight position={[-5, 5, 5]} intensity={3} />
                      <directionalLight position={[0, 5, 0]} intensity={3} />
                      <directionalLight position={[0, -5, 0]} intensity={3} />
                      <OrbitControls />
                      {thingId && <ModelViewer url={getModelPath(thingId)} />}
                    </Canvas>
                  </Suspense>
                </div>
              </Card>

              {/* Thing ID Card */}
              <Card title="Thing ID" size="small">
                <TextLabel text={thingId} />
              </Card>

              {/* Features Card */}
              <Card title="Features">
                <List
                  dataSource={features}
                  renderItem={(feature) => (
                    <List.Item>
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <TextLabel text={feature.name} />
                        <Tag color="blue">{feature.type}</Tag>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Space>
          </Col>

          {/* Right Column - MQTT Documentation */}
          <Col xs={24} lg={14}>
            <Card 
              title={
                <span>
                  <ApiOutlined style={{ marginRight: 8 }} />
                  MQTT Documentation
                </span>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Alert
                  message="Real-time Communication"
                  description="This model supports MQTT for real-time communication. Send messages based on the following information."
                  type="info"
                  showIcon
                />

                <Divider orientation="left">
                  <CodeOutlined /> Connection Details
                </Divider>

                <div>
                  <Text strong>MQTT Port:</Text>
                  <pre
                    style={{
                      backgroundColor: "#f5f5f5",
                      padding: "12px",
                      borderRadius: "6px",
                      marginTop: "8px",
                      fontFamily: "monospace",
                    }}
                  >
                    <code>1884</code>
                  </pre>
                </div>

                <div>
                  <Text strong>MQTT Topic:</Text>
                  <pre
                    style={{
                      backgroundColor: "#f5f5f5",
                      padding: "12px",
                      borderRadius: "6px",
                      marginTop: "8px",
                      fontFamily: "monospace",
                    }}
                  >
                    <code>{getType(thingId)}/incoming/{thingId.split(':')[1]}</code>
                  </pre>
                </div>

                <Divider orientation="left">
                  <CodeOutlined /> Payload Structure
                </Divider>

                <div>
                  <Text strong>MQTT Payload:</Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    The payload should be a JSON object with the following structure:
                  </Paragraph>
                  <pre
                    style={{
                      background: "#f5f5f5",
                      fontFamily: "monospace",
                      padding: "12px",
                      borderRadius: "6px",
                      whiteSpace: "pre-wrap",
                      overflow: "auto",
                    }}
                  >
                    <code>
                      {`{
  "thingId": "${thingId}",
${features.map((f) => `  "${f.name}"?: (value for ${f.name})`).join(",\n")}
}`}
                    </code>
                  </pre>
                </div>

                <Alert
                  message="Important Notes"
                  description={
                    <>
                      <Paragraph style={{ margin: 0 }}>
                        • The <Text code>thingId</Text> field is required.
                      </Paragraph>
                      <Paragraph style={{ margin: 0 }}>
                        • Other fields correspond to the features of the model.
                      </Paragraph>
                      <Paragraph style={{ margin: 0 }}>
                        • Values should match the expected data types for each feature.
                      </Paragraph>
                      <Paragraph style={{ margin: 0 }}>
                        • All features are optional - send only what you want to update.
                      </Paragraph>
                    </>
                  }
                  type="warning"
                  showIcon
                />
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
}
