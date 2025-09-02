import { useParams } from "react-router-dom";
import { Menu } from "../components/Menu";
import { DeviceEvents } from "../components/DeviceEvents";

export const DeviceEventsPage = () => {
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
        <DeviceEvents thingId={thingId!} />
      </div>
    </div>
  );
};
