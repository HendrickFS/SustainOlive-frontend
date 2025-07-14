import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "../components/Menu";
import { ModelsGrid } from "../components/ModelsGrid";

export function Models() {
    return (
        <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    backgroundColor: "#f0f0f0"
                }}>
                <Menu />

                <div style={{
                    width: '85%',
                    height: '100vh',
                    overflow: 'hidden',
                    backgroundColor: '#dfdfdfff',
                }}>
                    <ModelsGrid />
                </div>
        </div>
    );
}