import { useState } from "react";

import Sidebar from "../components/Sidebar";
import MapView from "../components/MapView";
import MapEditorPanel from "../components/MapEditorPanel";

export default function MapEditorPage(){

  const [refresh,setRefresh] = useState(0);

  return(

    <div style={{display:"flex"}}>

      <Sidebar/>

      <div style={{flex:1,display:"flex"}}>

        {/* Map */}
        <div style={{flex:1}}>

          <MapView refreshKey={refresh} />

        </div>

        {/* Editor Panel */}
        <MapEditorPanel
          onSaved={()=>setRefresh(r=>r+1)}
        />

      </div>

    </div>

  )

}