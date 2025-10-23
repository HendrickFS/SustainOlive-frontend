import { Menu } from "../components/Menu";
import { PageHeader } from "../components/PageHeader";
import { ModelsData } from "../components/ModelsData";
import { DatabaseOutlined } from "@ant-design/icons";


export function ModelsDataPage() {
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
            title="Models Data"
            description="View real-time data from your production models."
            icon={<DatabaseOutlined />}
          />
          <div style={{ height: "calc(100vh - 120px)", overflow: "auto" }}>
            <ModelsData />
          </div>
        </div>
      </div>
    );
}