import { AllEventsList } from "../components/AllEventsList";
import { Menu } from "../components/Menu";
import { PageHeader } from "../components/PageHeader";
import { UnorderedListOutlined } from "@ant-design/icons";

export function AllEventsPage() {
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
            <div style={{ height: "calc(100vh - 120px)", overflow: "auto" }}>
              <AllEventsList />
            </div>
          </div>
        </div>
  );
}
