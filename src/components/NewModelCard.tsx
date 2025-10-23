import React, { useEffect, useRef, useState, useMemo } from "react";
import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { NewModelPage } from "../pages/NewModelPage";
import { mod } from "three/tsl";
import { createSimilarModel } from "../utils/dittoModelUtils";
import { postModel } from "../api/modelApi";

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function NewModelCard({ modelTypes = [] }: { modelTypes?: string[] }) {
  const [isModelOpen, setIsModelOpen] = useState(false);

  async function handleCreateSimilarModel(type: string) {
    const newModel = await createSimilarModel(type);
    try {
      await postModel(newModel);
      navigate(`/model-info/${newModel.thingId}`);
    } catch (error) {
      console.error("Error saving model:", error);
    }
  }

  const navigate = useNavigate();
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        color: "black",
        padding: "20px",
        borderRadius: "12px",
        border: "2px dashed #d9d9d9",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        width: "300px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onClick={() => setIsModelOpen(true)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#262626";
        e.currentTarget.style.backgroundColor = "#fafafa";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#d9d9d9";
        e.currentTarget.style.backgroundColor = "#ffffff";
      }}
    >
      {isModelOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModelOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              width: "420px",
              padding: "32px",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              margin: 0,
              fontSize: "20px",
              fontWeight: 600,
              color: "#262626"
            }}>
              Select Model Type
            </h2>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxHeight: "400px",
              overflowY: "auto"
            }}>
            {modelTypes.length > 0 ? (
              modelTypes.map((type, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsModelOpen(false);
                    handleCreateSimilarModel(type);
                  }}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#fff",
                    color: "#262626",
                    border: "1px solid #d9d9d9",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: "all 0.3s ease",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#262626";
                    e.currentTarget.style.backgroundColor = "#fafafa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#d9d9d9";
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                >
                  Create similar to: {capitalize(type)}
                </button>
              ))
            ) : (
              <p style={{ 
                margin: 0,
                fontSize: "14px",
                color: "#8c8c8c",
                textAlign: "center"
              }}>No model types detected</p>
            )}
            </div>
            <button
              onClick={() => {
                setIsModelOpen(false);
                navigate("/new-model");
              }}
              style={{
                padding: "12px 20px",
                backgroundColor: "#262626",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#434343";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#262626";
              }}
            >
              Create New Model
            </button>
            <button
              onClick={() => setIsModelOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#8c8c8c",
                cursor: "pointer",
                padding: "8px",
                fontSize: "14px",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#262626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#8c8c8c";
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px"
      }}>
        <div
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: "50%",
            width: "80px",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            color: "#595959",
          }}
        >
          <MdAdd />
        </div>
        <div style={{
          textAlign: "center"
        }}>
          <h3 style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 600,
            color: "#262626",
            marginBottom: "4px"
          }}>Add New Model</h3>
          <p style={{
            margin: 0,
            fontSize: "13px",
            color: "#8c8c8c"
          }}>Click to create a new model</p>
        </div>
      </div>
    </div>
  );
}
