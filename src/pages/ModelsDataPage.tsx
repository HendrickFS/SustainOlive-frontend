import { Menu } from "../components/Menu";
import { ModelsData } from "../components/ModelsData";


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
            backgroundColor: "#dfdfdfff",
          }}
        >
            <ModelsData />
        </div>
      </div>
    );
}