import { DeviceList } from "../components/DeviceList";
import { Menu } from "../components/Menu";
import { PageHeader } from "../components/PageHeader";
import { UnorderedListOutlined } from "@ant-design/icons";

export const DeviceListPage = () => {
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
          title="Device List"
          description="Browse and monitor all your connected production devices."
          icon={<UnorderedListOutlined />}
        />
        <div style={{ height: "calc(100vh - 120px)", overflow: "auto" }}>
          <DeviceList />
        </div>
      </div>
    </div>
  );
};
