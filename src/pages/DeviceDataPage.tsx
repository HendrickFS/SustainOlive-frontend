import { useParams } from "react-router-dom";
import { DeviceData } from "../components/DeviceData";
import { Menu } from "../components/Menu";

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
          backgroundColor: "#dfdfdfff",
        }}
      >
        <DeviceData thingId={thingId!} />
      </div>
    </div>
  );
};
