import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu as AntMenu } from "antd";
import {
  HomeOutlined,
  TableOutlined,
  HddOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

import sustainoliveLogo from "../assets/pegada.png";
import ipbLogo from "../assets/ipbLogo.png";
import "./Menu.css";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

export function Menu() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      key: "/home",
      icon: <HomeOutlined />,
      label: "Home",
    },
    {
      key: "/models-data",
      icon: <TableOutlined />,
      label: "Data",
    },
    {
      key: "/devices",
      icon: <HddOutlined />,
      label: "Devices",
    },
    {
      key: "/models",
      icon: <FileTextOutlined />,
      label: "Models",
    },
    {
      key: "/all-events",
      icon: <HistoryOutlined />,
      label: "Events",
    },
    {
      key: "/",
      icon: <LogoutOutlined />,
      label: "Logout",
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  return (
    <Sider
      width="15%"
      style={{
        height: "100vh",
        backgroundColor: "#2C2803",
        boxShadow: "2px 0 5px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          alignItems: "center",
          paddingTop: "30px",
        }}
      >
        <img
          src={sustainoliveLogo}
          alt="Sustainolive Logo"
          style={{ width: "200px", marginBottom: "20px" }}
        />

        <h2
          style={{
            color: "white",
            textAlign: "center",
            fontSize: "18px",
            marginBottom: "30px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Menu
        </h2>

        <AntMenu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            width: "100%",
            fontSize: "18px",
            fontFamily: "Inter, sans-serif",
          }}
          theme="dark"
        />

        <img
          src={ipbLogo}
          alt="IPB Logo"
          style={{ width: "200px", marginTop: "auto", marginBottom: "20px" }}
        />
      </div>
    </Sider>
  );
}

