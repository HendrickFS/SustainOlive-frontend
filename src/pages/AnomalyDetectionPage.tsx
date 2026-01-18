import { useState, useMemo } from "react";
import { Menu } from "../components/Menu";
import { PageHeader } from "../components/PageHeader";
import { Tabs } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { AnomalyDetectionFeature } from "../components/AnomalyDetection/AnomalyDetectionFeature";

export function AnomalyDetectionPage() {
  const [activeTab, setActiveTab] = useState<string>("anomaly-detection");

  const tabItems = [
    {
      key: "anomaly-detection",
      label: "Anomaly Detection",
      children: <AnomalyDetectionFeature />,
    },
    // TODO: Add more AI features here
    // {
    //   key: "predictive-maintenance",
    //   label: "Predictive Maintenance",
    //   children: <PredictiveMaintenanceFeature />,
    // },
    // {
    //   key: "trend-analysis",
    //   label: "Trend Analysis",
    //   children: <TrendAnalysisFeature />,
    // },
  ];

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
          backgroundColor: "#fff",
        }}
      >
        <PageHeader
          title="AI Dashboard"
          description="Advanced AI-powered insights for your olive production monitoring."
          icon={<ThunderboltOutlined />}
        />

        <div style={{ height: "calc(100vh - 120px)", overflow: "auto", padding: "20px" }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{
              backgroundColor: "#fff",
            }}
            tabBarStyle={{
              marginBottom: "20px",
              borderBottom: "2px solid #f0f0f0",
            }}
          />
        </div>
      </div>
    </div>
  );
}
