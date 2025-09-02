import { useEffect, useState } from "react";
import { getModels, type Model } from "../api/modelApi";
import { useNavigate } from "react-router-dom";
import { formatName } from "../utils/formatting";

export function DeviceList() {
  const [models, setModels] = useState<Model[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchModels = async () => {
      const data = await getModels();
      setModels(data);
    };
    fetchModels();
  }, []);

  const handleRedirect = (thingId: string) => {
    navigate(`/device-data/${thingId}`);
  };

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
      <h2>Device List</h2>
      <div style={{ height: "16px" }}></div>
{models.map((model) => (
  <div
    key={model.thingId}
    onClick={() => handleRedirect(model.thingId)}
    style={{
      background: "linear-gradient(90deg, #f0f4ff, #ffffff)",
      borderLeft: "4px solid #2C2803",
      width: "200px",
      height: "75px",
      padding: "16px",
      margin: "8px",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      cursor: "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = "scale(1.03)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
    }}
  >
    <h3 style={{
      fontSize: "16px",
      fontWeight: 500,
      color: "#1f2937",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }}>
      {formatName(model.thingId)}
    </h3>
    <p style={{
      fontSize: "12px",
      color: "#6b7280",
      marginTop: "4px"
    }}>
      View Details
    </p>
  </div>
))}
    </div>
  );
}
