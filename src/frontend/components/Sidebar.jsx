import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Sidebar() {
  const location = useLocation();
  const { t } = useLanguage();

  const linkStyle = (path) => ({
    display: "block",
    marginBottom: "12px",
    color: "white",
    textDecoration: "none",
    fontWeight: location.pathname === path ? "bold" : "normal",
    background: location.pathname === path ? "#334155" : "transparent",
    padding: "8px 10px",
    borderRadius: "6px",
  });

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
      <h2>{t("dashboard")}</h2>

      <div style={{ marginTop: "20px" }}>
        <Link to="/admin/dashboard" style={linkStyle("/admin/dashboard")}>
          {t("dashboard")}
        </Link>

        <Link to="/admin/orders" style={linkStyle("/admin/orders")}>
          {t("orders")}
        </Link>

        <Link to="/admin/areas" style={linkStyle("/admin/areas")}>
          {t("distributionAreas")}
        </Link>

         <Link to="/admin/settings" style={linkStyle("/admin/settings")}>
          {t("settings")}
        </Link>

        <Link to="/admin/add" style={linkStyle("/admin/add")}>
          {t("addNewArea")}
        </Link>

       
      </div>

      <LanguageSwitcher />
    </div>
  );
}