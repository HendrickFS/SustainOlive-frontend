import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { ImFileText2 } from "react-icons/im";


export function Menu() {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState("Home");
    const menuItems = [
        { name: "Home", path: "/home", icon: <FaHome /> },
        { name: "Models", path: "/models", icon: <ImFileText2 /> },
        { name: "Profile", path: "/profile", icon: <FaUser /> },
        { name: "Settings", path: "/settings", icon: <FaCog /> },
        { name: "Logout", path: "/", icon: <FaSignOutAlt /> }
    ];
    const handleItemClick = (item: string) => {
        setActiveItem(item);
        if (item === 'Logout') {
            navigate("/");
        } else {
            navigate(`/${item.toLowerCase()}`);
        }
    };

    return (
        <div style={{
                width: '15%',
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: '#2C2803',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '30px',
                boxShadow: '2px 0 5px rgba(0, 0, 0, 0.2)'
                }}>
                <h1 style={{
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '24px',
                    marginBottom: '10px',
                    fontWeight: 'bold'
                }}>
                    SustainOlive
                </h1>

                <h2 style={{
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '18px',
                    marginBottom: '30px'
                }}>
                    Menu
                </h2>

                <ul style={{
                    listStyleType: 'none',
                    padding: 0,
                    width: '100%'
                }}>
                    {menuItems.map(({ name, path, icon }) => {
                    const isActive = location.pathname === path;
                    return (
                    <li
                        key={name}
                        onClick={() => navigate(path)}
                        style={{
                        color: 'white',
                        textAlign: 'center',
                        padding: '12px 0',
                        cursor: 'pointer',
                        backgroundColor: isActive ? '#3a3605' : 'transparent',
                        fontWeight: isActive ? 'bold' : 'normal',
                        borderLeft: isActive ? '4px solid white' : '4px solid transparent',
                        transition: 'background 0.3s, border-left 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px', // espaço entre ícone e texto
                        fontSize: '18px',
                        }}
                        onMouseOver={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '#3a3605';
                        }}
                        onMouseOut={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        {icon}
                        <span>{name}</span>
                    </li>
                    );
                    })}
                </ul>
         </div>
    );


}

