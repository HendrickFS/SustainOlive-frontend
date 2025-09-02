import { useEffect, useState } from "react";
import { getModels, type Model } from "../api/modelApi";
import { useNavigate } from "react-router-dom";
import {
  formatName,
  formatFeatureName,
  formatTimestamp,
} from "../utils/formatting";

function isModelCritical(model: Model): boolean {
  const features = model.features ?? {};
  return Object.values(features as any).some((data: any) => {
    const value = data?.properties?.value;
    if (value == null) return false;

    const min = data?.properties?.minValue;
    const max = data?.properties?.maxValue;

    const checkOne = (v: any) => {
      const n = Number(v);
      if (Number.isNaN(n)) return false;
      if (min != null && n < Number(min)) return true;
      if (max != null && n > Number(max)) return true;
      return false;
    };

    if (Array.isArray(value)) return value.some(checkOne);
    return checkOne(value);
  });
}

export function ModelsData() {
  const [loading, setLoading] = useState<boolean>(true);
  const [models, setModels] = useState<Model[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [filteredModels, setFilteredModels] = useState<Model[]>(models);

  const navigate = useNavigate();

  const refreshModels = () => {
    getModels()
      .then((data) => {
        setModels(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching models:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    getModels()
      .then((data) => {
        setModels(data);
        setFilteredModels(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching models:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "#dfdfdfff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: filter === "All" ? "#2C2803" : "transparent",
              color: filter === "All" ? "#fff" : "#2C2803",
              border: "1px solid #2C2803",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => {
              setFilter("All");
              setFilteredModels(models);
            }}
          >
            All
          </button>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor:
                filter === "Critical" ? "#2C2803" : "transparent",
              color: filter === "Critical" ? "#fff" : "#2C2803",
              border: "1px solid #2C2803",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => {
              setFilter("Critical");
              setFilteredModels(models.filter(isModelCritical));
            }}
          >
            Critical
          </button>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor:
                filter === "Non-Critical" ? "#2C2803" : "transparent",
              color: filter === "Non-Critical" ? "#fff" : "#2C2803",
              border: "1px solid #2C2803",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => {
              setFilter("Non-Critical");
              setFilteredModels(
                models.filter((model) => !isModelCritical(model))
              );
            }}
          >
            Non-Critical
          </button>
        </div>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "transparent",
            color: "#2196F3",
            border: "1px solid #2196F3",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => {
            refreshModels();
          }}
        >
          Refresh
        </button>
      </div>
      {filteredModels.map((model) => (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            margin: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ fontFamily: "Inter, sans-serif" }}>
              {formatName(model.thingId)}
            </h3>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#fff",
                color: "#2196F3",
                border: "1px solid #2196F3",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/device-data/${model.thingId}`)}
            >
              View Data Log
            </button>
          </div>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              marginTop: "8px",
              fontFamily: "Arial, sans-serif",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    width: "20%",
                    textAlign: "left",
                  }}
                >
                  Feature
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    width: "20%",
                    textAlign: "left",
                  }}
                >
                  Value
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    width: "15%",
                    textAlign: "left",
                  }}
                >
                  Minimum Value
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    width: "15%",
                    textAlign: "left",
                  }}
                >
                  Maximum Value
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    width: "15%",
                    textAlign: "left",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    width: "15%",
                    textAlign: "left",
                  }}
                >
                  Update Time
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(model.features).map(
                ([name, data]: [string, any]) => {
                  const backgroundColor =
                    data.properties?.minValue != null &&
                    data.properties?.maxValue != null
                      ? data.properties.value >= data.properties.minValue &&
                        data.properties.value <= data.properties.maxValue
                        ? "#d4edda"
                        : "#f8d7da"
                      : "#fff";

                  return (
                    <tr key={name}>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ccc",
                          backgroundColor: backgroundColor,
                        }}
                      >
                        {formatFeatureName(name)}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ccc",
                          backgroundColor: backgroundColor,
                        }}
                      >
                        {Array.isArray(data.properties?.value)
                          ? data.properties.value.join(", ")
                          : data.properties?.value !== undefined
                          ? `${data.properties.value}${
                              data.properties?.unit
                                ? " " + data.properties.unit
                                : ""
                            }`
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ccc",
                          backgroundColor: backgroundColor,
                        }}
                      >
                        {data.properties?.minValue !== undefined
                          ? `${data.properties.minValue}${
                              data.properties?.unit
                                ? " " + data.properties.unit
                                : ""
                            }`
                          : "-"}
                      </td>

                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ccc",
                          backgroundColor: backgroundColor,
                        }}
                      >
                        {data.properties?.maxValue !== undefined
                          ? `${data.properties.maxValue}${
                              data.properties?.unit
                                ? " " + data.properties.unit
                                : ""
                            }`
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ccc",
                          backgroundColor: backgroundColor,
                        }}
                      >
                        {backgroundColor === "#d4edda"
                          ? "Non-Critical"
                          : backgroundColor === "#f8d7da"
                          ? "Critical"
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ccc",
                          backgroundColor: backgroundColor,
                        }}
                      >
                        {data.properties?.timestamp
                          ? formatTimestamp(data.properties.timestamp)
                          : "Unknown"}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
