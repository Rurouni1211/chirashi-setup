import { useState } from "react";
import Sidebar from "../components/Sidebar";
import MapView from "../components/MapView";
import MapEditorPanel from "../components/MapEditorPanel";

export default function MapAddPage() {
  const [refresh, setRefresh] = useState(0);
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ flex: 1 }}>
          <MapView refreshKey={refresh} />
        </div>
        <MapEditorPanel onSaved={() => setRefresh((r) => r + 1)} />
      </div>
    </div>
  );
}