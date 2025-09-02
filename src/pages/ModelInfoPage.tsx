import React from "react";
import { Menu } from "../components/Menu";
import { ModelInfo } from "../components/ModelInfo";
import { useParams } from "react-router-dom";

export function ModelInfoPage() {
  const { thingId } = useParams<{ thingId: string }>();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f0f0",
      }}
    >
      <Menu />
      <div
        style={{
          width: "85%",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#dfdfdfff",
        }}
      >
        <ModelInfo thingId={thingId!} />

      </div>
    </div>
  );
}
