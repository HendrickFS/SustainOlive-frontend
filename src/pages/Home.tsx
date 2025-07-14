import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "../components/Menu";

export function Home() {
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
                <h1>Welcome to the home page</h1>
                <p>This is the main content area.</p>
            </div>
        </div>
    );
}