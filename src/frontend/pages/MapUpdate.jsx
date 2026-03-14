import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MapView from "../components/MapView";
import MapEditorPanel from "../components/MapEditorPanel";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

//const API_BASE = "http://localhost:5000";

export default function MapUpdate(){
  const { ku } = useParams();
  const [refresh, setRefresh] = useState(0);
  const [existingData, setExistingData] = useState(null);

  // Fetch the existing information to carry it into the editor
  useEffect(() => {
    fetch(`${API}/property/${encodeURIComponent(ku)}`)
      .then(res => res.json())
      .then(data => setExistingData(data))
      .catch(err => console.error("Error loading area:", err));
  }, [ku]);

  return(
    <div style={{display:"flex"}}>
      <Sidebar/>
      <div style={{flex:1, display:"flex"}}>
        <div style={{flex:1}}>
          <MapView highlight={ku} refreshKey={refresh}/>
        </div>
        <MapEditorPanel 
          initialData={existingData} 
          onSaved={() => setRefresh(r => r + 1)}
        />
      </div>
    </div>
  )
}