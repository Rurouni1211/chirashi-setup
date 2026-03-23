import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AreasList from "./frontend/pages/AreaList";
import MapShow from "./frontend/pages/MapShow";
import MapUpdate from "./frontend/pages/MapUpdate";
import UserView from "./frontend/pages/UserView";
import MapAddPage from "./frontend/pages/MapAppPage";
import DashboardPage from "./frontend/pages/DashboardPage";
import MapEditorPage from "./frontend/pages/MapEditorPage";
import SettingsPage from "./frontend/pages/SettingsPage";
import OrdersPage from "./frontend/pages/OrdersPage";
import { LanguageProvider } from "./frontend/context/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserView />} />
          <Route path="/admin" element={<Navigate to="/admin/areas" />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
          <Route path="/admin/areas" element={<AreasList />} />
          <Route path="/admin/add" element={<MapAddPage />} />
          <Route path="/admin/edit" element={<MapEditorPage />} />
          <Route path="/admin/show/:ku" element={<MapShow />} />
          <Route path="/admin/update/:ku" element={<MapUpdate />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}