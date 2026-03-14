import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  return (
    <div
      style={{
        width: "220px",
        background: "#0f172a",
        color: "white",
        padding: "20px",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <h2>Admin Panel</h2>

      <div style={{ marginTop: "20px" }}>
        <Link
          to="/admin/areas"
          style={{
            display: "block",
            marginBottom: "12px",
            color: "white",
            textDecoration: "none",
            fontWeight: location.pathname === "/admin/areas" ? "bold" : "normal",
            background: location.pathname === "/admin/areas" ? "#334155" : "transparent",
            padding: "8px 10px",
            borderRadius: "6px",
          }}
        >
          Distribution Areas
        </Link>

        <Link
          to="/admin/add"
          style={{
            display: "block",
            marginBottom: "12px",
            color: "white",
            textDecoration: "none",
            fontWeight: location.pathname === "/admin/add" ? "bold" : "normal",
            background: location.pathname === "/admin/add" ? "#334155" : "transparent",
            padding: "8px 10px",
            borderRadius: "6px",
          }}
        >
          + Add New Area
        </Link>
      </div>
    </div>
  );
}