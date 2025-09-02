import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "../components/Menu";
import { div } from "three/tsl";
import { DataCard } from "../components/DataCard";
import { DeviceList } from "../components/DeviceList";

interface Feature {
  properties: {
    value: number | number[] | string | string[];
  };
}

interface Model {
  thingId: string;
  policyId: string;
  features: Record<string, Feature>;
}

export function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "start",
        height: "100vh",
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
        <DeviceList></DeviceList>
      </div>
    </div>
  );
}
