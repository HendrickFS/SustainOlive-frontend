import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { getModel } from "../api/modelApi";
import type { Model } from "../api/modelApi";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { TextLabel } from "./TextLabel";
import { getType } from "../utils/formatting";

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
        padding: "32px",
        maxWidth: "100%",
        height: "100vh",
        overflowY: "auto",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
      }}
    >
      <h1 style={{ fontFamily: "Inter, sans-serif" }}>
        {capitalize(modelType) == "Deposit" ? "Storage Tank" : capitalize(modelType)} Model Information
      </h1>
      <div style={{ height: "40px" }} />
      <div
        style={{
          width: "100%",
          paddingBottom: "16px",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "40%",
            padding: "16px",
          }}
        >
          <div>
            <div
              style={{
                width: "100%",
                height: "400px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Suspense fallback={<div>Loading model...</div>}>
                <Canvas
                  camera={{ position: [0, 0, 3] }}
                  style={{ width: "400px", height: "400px" }}
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
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              width: "100%",
              gap: "10px",
            }}
          >
            <h2 style={{ fontFamily: "Inter, sans-serif" }}>Thing ID:</h2>
            <TextLabel text={capitalize(modelType) == "Deposit" ? "olive.production:storage_tank001" : thingId} />
            <h2 style={{ fontFamily: "Inter, sans-serif" }}>Features:</h2>
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                margin: 0,
                width: "100%",
              }}
            >
              {features.map((feature, index) => (
                <li
                  key={index}
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "12px 16px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "12px",
                      justifyContent: "space-between",
                      width: "100%",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "12px",
                        fontFamily: "Arial, sans-serif",
                        width: "100%",
                      }}
                    >
                      <TextLabel text={feature.name} />
                      <span
                        style={{
                          backgroundColor: "#f0f0f0",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          color: "#333",
                        }}
                      >
                        {feature.type}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            width: "60%",
            gap: "10px",
            padding: "16px",
            borderLeft: "2px solid #ccc",
          }}
        >
          {/* MQTT documentation */}
          <h2 style={{ fontFamily: "Inter, sans-serif" }}>
            MQTT Documentation
          </h2>
          <p>
            This model supports MQTT for real-time communication. Send messagens
            based on the following information.
          </p>
          <div style={{ height: "10px" }} />
          <h3 style={{ fontFamily: "Inter, sans-serif" }}>MQTT Port:</h3>

          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <code>1884</code>
          </pre>
          <div style={{ height: "10px" }} />
          <h3 style={{ fontFamily: "Inter, sans-serif" }}>MQTT Topic:</h3>

          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <code>
              {getType(thingId)}/incoming/{capitalize(modelType) == "Deposit" ? "olive.production:storage_tank001" : thingId}
            </code>
          </pre>

          <div style={{ height: "10px" }} />
          <h3 style={{ fontFamily: "Inter, sans-serif" }}>MQTT Payload:</h3>
          <p>
            The payload should be a JSON object with the following structure:
          </p>
          <pre
            style={{
              background: "#f5f5f5",
              fontFamily: "monospace",
              padding: "12px",
              borderRadius: "6px",
              whiteSpace: "pre-wrap",
            }}
          >
            <code>
              {`{
  "thingId": "${thingId}",
${features.map((f) => `  "${f.name}"?: (value for ${f.name})`).join(",\n")}
}`}
            </code>
          </pre>
          <p>
            Note that the "thingId" field is required, and the other fields
            correspond to the features of the model. The values should match the
            expected data types for each feature. All features are optional, and
            it's possible to send only the features you want to update.
          </p>
        </div>
      </div>
    </div>
  );
}
