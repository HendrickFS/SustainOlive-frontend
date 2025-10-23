import { useParams } from "react-router-dom";
import { DeviceData } from "../components/DeviceData";
import { Menu } from "../components/Menu";
import { PageHeader } from "../components/PageHeader";
import { LineChartOutlined } from "@ant-design/icons";

export const DeviceDataPage = () => {
  const { thingId } = useParams<{ thingId: string }>();

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
          title="Device Data"
          description="View real-time and historical data from this device."
          icon={<LineChartOutlined />}
        />
        <div style={{ height: "calc(100vh - 120px)", overflow: "auto" }}>
          <DeviceData thingId={thingId!} />
        </div>
      </div>
    </div>
  );
};
