import React, { useState } from "react"
import { useNavigate } from "react-router-dom";

import oliveOilImg from "../assets/azeite_app.png"
import azeiteImg from "../assets/azeite.jpg"
import { Home } from "./Home";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    function handleLogin() {
        navigate("/home");
    }

    return (
        <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                backgroundColor: "#f0f0f0"
            }}>
            <img src={oliveOilImg} alt="Olive oil app" style={{
                width: "70%",
                height: "100%",
                objectFit: "cover",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}/>

            <div style={{ 
                position: 'relative', 
                width: '50%', 
                height: '100vh', 
                overflow: 'hidden' 
            }}>
                <img 
                    src={azeiteImg} 
                    alt="Background" 
                    style={{ 
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    filter: 'blur(15px) brightness(0.5)',
                    zIndex: 0,
                    scale: '1.5',
                    }} 
                />
                <div style={{ position: 'relative',
                    zIndex: 1,
                    color: 'white',
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    gap: "20px",
                }}>
                    <h2>Login</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ marginBottom: "10px", padding: "8px", width: "300px" }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ marginBottom: "10px", padding: "8px", width: "300px" }}
                    />
                    <button
                        onClick={handleLogin}
                        style={{ padding: "10px 20px",backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>
                        Login
                    </button>
                </div>
            </div>
        </div>
    );

}