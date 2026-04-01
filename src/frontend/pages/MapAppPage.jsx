import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import MapView from "../components/MapView";
import MapEditorPanel from "../components/MapEditorPanel";

export default function MapAddPage() {
  const [refresh, setRefresh] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "100vh",
        background: "#f1f5f9",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          minWidth: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            width: "100%",
          }}
        >
          <MapView
            refreshKey={refresh}
            preventRegisteredAreaSelection={true}
          />
        </div>

        <MapEditorPanel onSaved={() => setRefresh((r) => r + 1)} />
      </div>
    </div>
  );
}