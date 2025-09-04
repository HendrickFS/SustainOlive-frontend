import React, { use, useEffect } from "react";
import { TextLabel } from "./TextLabel";
import { CustomTextField } from "./CustomTextField";
import { MdEdit, MdDelete } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import type { Model } from "../api/modelApi";
import { getModel, postModel, updateModel } from "../api/modelApi";
import { getType } from "../utils/formatting";

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const FeaturesTypes = ["Boolean", "Number", "String", "Date", "Array"];

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
  const [model, setModel] = React.useState<Model | null>(null);

  const [modelType, setModelType] = React.useState(
    thingId ? getType(thingId) : ""
  );
  const [features, setFeatures] = React.useState<Feature[]>([]);
  const [newFeature, setNewFeature] = React.useState({
    name: "",
    type: "String",
    value: "",
    minValue: 0,
    maxValue: 0,
    unit: "",
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    if (thingId) {
      getModel(thingId).then((model: Model) => {
        setModel(model);
        setModelType(getType(model.thingId));
        const featuresArray = Object.entries(model.features).map(
          ([featureName, featureData]: [string, any]) => ({
            name: featureName,
            type:
              capitalize(typeof featureData.properties.value) === "Object" &&
              Array.isArray(featureData.properties.value)
                ? "Array"
                : capitalize(typeof featureData.properties.value),
            value:
              featureData.properties.value ??
              DefaultFeatureValues[typeof featureData.properties.value],
            minValue: featureData.properties.minValue ?? null,
            maxValue: featureData.properties.maxValue ?? null,
            unit: featureData.properties.unit ?? "",
            timestamp:
              featureData.properties.timestamp ?? new Date().toISOString(),
          })
        );

        setFeatures(featuresArray);
      });
    }
  }, [thingId]);

  const navigate = useNavigate();

  const handleSave = async () => {
    const newModel: Model = {
      thingId: thingId || "",
      policyId: "olive.default:policy", // Assuming policyId is not required for now
      features: features.reduce((acc, feature) => {
        if (!model!.features.hasOwnProperty(feature.name)) {
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
          acc[feature.name] = model!.features[feature.name];
        }
        return acc;
      }, {} as Record<string, any>),
    };

    try {
      await updateModel(newModel);
      navigate("/models");
    } catch (error) {
      console.error("Error saving model:", error);
    }
  };

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
        alignItems: "center",
      }}
    >
      <h1 style={{ fontFamily: "Arial, sans-serif" }}>Editing Model</h1>
      <div style={{ height: "20px" }} />
      <div
        style={{
          width: "50%",
        }}
      >
        <CustomTextField
          label="Model type"
          value={modelType}
          onChange={(value) => setModelType(value)}
          placeholder='e.g., "Deposit", "Mill", "Bin"...'
          enabled={false}
        />
        <div style={{ height: "20px" }} />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "4px",
            alignItems: "center",
            fontFamily: "Arial, sans-serif",
            width: "50%",
          }}
        >
          <TextLabel text="ThingId:" />
          <p>{thingId ? thingId : "No ThingId provided"}</p>
        </div>
        <div style={{ height: "20px" }} />
        <h2
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "24px",
            marginBottom: "12px",
          }}
        >
          Features
        </h2>

        <div>
          {features.length > 0 ? (
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
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <button
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          transition: "transform 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = "scale(1.2)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                        onClick={() => {
                          setFeatures(features.filter((_, i) => i !== index));
                        }}
                      >
                        <MdDelete size={24} color="red" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontStyle: "italic", color: "#888" }}>
              No features added yet.
            </p>
          )}
        </div>

        <div style={{ height: "20px" }} />
        <TextLabel text="New Feature" />
        <div style={{ height: "8px" }} />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            alignItems: "center",
            fontFamily: "Arial, sans-serif",
            width: "100%",
          }}
        >
          <div style={{ flexGrow: 1 }}>
            <CustomTextField
              value={newFeature.name}
              onChange={(value) =>
                setNewFeature({ ...newFeature, name: value })
              }
              placeholder='Feature name (e.g., "Temperature")'
            />
          </div>

          <select
            value={newFeature.type}
            onChange={(e) =>
              setNewFeature({ ...newFeature, type: e.target.value })
            }
            style={{
              padding: "8px",
              fontSize: "16px",
              fontFamily: "Arial, sans-serif",
              width: "100px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            {FeaturesTypes.map((featureType) => (
              <option key={featureType} value={featureType}>
                {featureType}
              </option>
            ))}
          </select>
          <button
            style={{
              padding: "8px 16px",
              fontSize: "16px",
              fontFamily: "Arial, sans-serif",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => {
              setFeatures([...features, newFeature]);
              setNewFeature({
                name: "",
                type: "String",
                value: "",
                minValue: 0,
                maxValue: 0,
                unit: "",
                timestamp: new Date().toISOString(),
              });
            }}
          >
            Add
          </button>
        </div>
        <div style={{ height: "10px" }} />
        {newFeature.type === "Number" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "8px",
              alignItems: "center",
              fontFamily: "Arial, sans-serif",
              width: "100%",
            }}
          >
            <div style={{ flexGrow: 1 }}>
              <CustomTextField
                value={newFeature.minValue}
                onChange={(value: string) => {
                  const parsed = value === "" ? 0 : Number(value);
                  setNewFeature({
                    ...newFeature,
                    minValue: parsed,
                  });
                }}
                placeholder="Minimum Value"
                type="number"
              />
            </div>
            <div style={{ flexGrow: 1 }}>
              <CustomTextField
                value={newFeature.maxValue}
                onChange={(value: string) => {
                  const parsed = value === "" ? 0 : Number(value);
                  setNewFeature({
                    ...newFeature,
                    maxValue: parsed,
                  });
                }}
                placeholder="Maximum Value"
                type="number"
              />
            </div>
            <div style={{ flexGrow: 1 }}>
              <CustomTextField
                value={newFeature.unit}
                onChange={(value) =>
                  setNewFeature({ ...newFeature, unit: value })
                }
                placeholder='Unit (e.g., "°C", "L", "%")'
              />
            </div>
          </div>
        )}
      </div>

      <div style={{ height: "20px" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "50%",
        }}
      >
        <button
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#c40707ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => {
            navigate(-1);
          }}
        >
          Cancel
        </button>
        <button
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => {
            handleSave();
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
