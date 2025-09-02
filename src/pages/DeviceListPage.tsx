import { DeviceList } from "../components/DeviceList";
import { Menu } from "../components/Menu";

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
          backgroundColor: "#dfdfdfff",
        }}
      >
        <DeviceList />
      </div>
    </div>
  );
};
