import { useEffect, useState } from "react";
import { getModel, type Model } from "../api/modelApi";
import { formatFeatureName, formatName } from "../utils/formatting";
import { FeatureEventsTable } from "./FeatureEventsTable";

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
    return <p>Loading...</p>;
  }

  return (
    <div
      style={{
        padding: "16px",
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
      <div
        style={{
          marginBottom: "24px",
          width: "100%",
          padding: "16px",
          backgroundColor: "#f9f9f9",
          borderLeft: "4px solid #2C2803",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#333" }}>
          {formatName(thingId)}
        </h2>
        <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
          <strong>Thing ID:</strong> {thingId}
        </p>
      </div>
      {loading && <p>Loading...</p>}

      {Object.entries(model.features).map(([name, featureData]) => (
        <div key={name}>
          <FeatureEventsTable
            model={model}
            featureName={name}
            featureData={featureData}
          />
        </div>
      ))}
    </div>
  );
}
