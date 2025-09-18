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
        backgroundColor: "#f0f0f0ff",
        color: "black",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        width: "300px",
        height: "450px",
        margin: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
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
        >
          <div
            style={{
              backgroundColor: "white",
              width: "400px",
              minHeight: "300px",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h2 style={{ fontFamily: "Arial, sans-serif" }}>
              Select Model Type
            </h2>
            <div style={{ marginBottom: "12px" }}></div>
            {modelTypes.length > 0 ? (
              modelTypes.map((type, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsModelOpen(false);
                    handleCreateSimilarModel(type);
                  }}
                  style={{
                    display: "block",
                    margin: "10px 0",
                    padding: "10px 20px",
                    backgroundColor: "#2C2803",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    width: "100%",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  {capitalize(type)}
                </button>
              ))
            ) : (
              <p>No model types detected</p>
            )}
            <button
              onClick={() => {
                setIsModelOpen(false);
                navigate("/new-model");
              }}
              style={{
                display: "block",
                margin: "10px 0",
                padding: "10px 20px",
                backgroundColor: "white",
                border: "2px solid #2C2803",
                color: "#2C2803",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%",
                fontFamily: "Arial, sans-serif",
              }}
            >
              New Model
            </button>
            <div style={{ marginTop: "12px" }}></div>
            <button
              onClick={() => setIsModelOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "black",
                cursor: "pointer",
                padding: 0,
                fontSize: "16px",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setIsModelOpen(true);
        }}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "64px",
          height: "64px",
          fontSize: "32px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          transition: "transform 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <MdAdd />
      </button>
    </div>
  );
}
