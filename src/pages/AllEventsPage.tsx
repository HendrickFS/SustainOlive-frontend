import { useState } from "react";
import { AllEventsList } from "../components/AllEventsList";
import { Menu } from "../components/Menu";
import { PageHeader } from "../components/PageHeader";
import { UnorderedListOutlined } from "@ant-design/icons";

const ranges = ["-1h", "-6h", "-12h", "-24h", "-7d", "-30d"];

export function AllEventsPage() {
  const [range, setRange] = useState<string>("-7d");

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
              backgroundColor: "#fff",
            }}
          >
            <PageHeader
              title="All Events"
              description="View and monitor the last event of each feature in real-time."
              icon={<UnorderedListOutlined />}
            />
            <div
              style={{
                padding: "16px 24px",
                backgroundColor: "#f9f9f9",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label
                  htmlFor="timeRange"
                  style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}
                >
                  Time Range
                </label>
                <select
                  id="timeRange"
                  name="timeRange"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    padding: "8px 12px",
                    fontSize: "14px",
                    color: "#374151",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {ranges.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ height: "calc(100vh - 200px)", overflow: "auto" }}>
              <AllEventsList range={range} />
            </div>
          </div>
        </div>
  );
}
