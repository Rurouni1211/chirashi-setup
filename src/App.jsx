import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import AdminDashboard from "./frontend/AdminDashboard";
import MapView from "./frontend/MapView";
import UserView from "./frontend/UserView";

import "./App.css";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleUserAreaClick = (ku) => {
    // You can pass this to MapView to center/zoom/highlight the area
    console.log("User clicked area:", ku);
    // Example: if MapView accepts a prop like selectedKu
    // → you could lift state up or use context
  };

  return (
    <Router>
      <div className="app-shell">
        <header className="topbar">
          <div className="topbar-content">
            <h1>Kobe Property Portal</h1>
            <nav className="nav-links">
              <Link to="/" className="nav-btn">
                Map
              </Link>
              <Link to="/admin" className="nav-btn admin-link">
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            {/* ── User view ── */}
            <Route
              path="/"
              element={
                <div className="user-layout">
                  <UserView onAreaClick={handleUserAreaClick} />
                  <div className="map-container">
                    <div className="welcome-banner">
                      <h2>Welcome to Kobe Property Search</h2>
                      <p>
                        Select an area from the sidebar or click directly on the
                        map.
                      </p>
                    </div>
                    <MapView refreshKey={refreshKey} userMode={true} />
                  </div>
                </div>
              }
            />

            {/* ── Admin view ── */}
            <Route
              path="/admin"
              element={
                <div className="admin-grid">
                  <section className="panel left-panel">
                    <AdminDashboard onSaved={handleSaved} />
                  </section>
                  <section className="panel right-panel">
                    <div className="preview-label">Live Preview</div>
                    <MapView refreshKey={refreshKey} userMode={false} />
                  </section>
                </div>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}