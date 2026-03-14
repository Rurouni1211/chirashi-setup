import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AreasList from "../src/frontend/pages/AreaList";
import MapShow from "../src/frontend/pages/MapShow";
import MapUpdate from "../src/frontend/pages/MapUpdate";
import UserView from "../src/frontend/pages/UserView";
// ADD THIS IMPORT (Ensure the path to MapAppPage is correct)
import MapAddPage from "../src/frontend/pages/MapAppPage"; 

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserView/>} />
        <Route path="/admin" element={<Navigate to ="/admin/areas" />} />
        <Route path="/admin/areas" element={<AreasList/>} />
        
        {/* ADD THIS ROUTE */}
        <Route path="/admin/add" element={<MapAddPage/>} />
        
        <Route path="/admin/show/:ku" element={<MapShow/>} />
        <Route path="/admin/update/:ku" element={<MapUpdate/>} />
      </Routes>
    </BrowserRouter>
  )
}