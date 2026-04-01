import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          style={{
            position: "fixed",
            top: "14px",
            right: "14px",
            zIndex: 1201,
            background: "#0f172a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            width: "44px",
            height: "44px",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "20px",
              height: "20px",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "20px",
                height: "2px",
                background: "white",
                borderRadius: "999px",
                transition: "transform 0.25s ease, opacity 0.25s ease",
                transform: menuOpen
                  ? "translate(-50%, -50%) rotate(45deg)"
                  : "translate(-50%, -7px) rotate(0deg)",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "20px",
                height: "2px",
                background: "white",
                borderRadius: "999px",
                transition: "opacity 0.2s ease",
                opacity: menuOpen ? 0 : 1,
                transform: "translate(-50%, -50%)",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "20px",
                height: "2px",
                background: "white",
                borderRadius: "999px",
                transition: "transform 0.25s ease, opacity 0.25s ease",
                transform: menuOpen
                  ? "translate(-50%, -50%) rotate(-45deg)"
                  : "translate(-50%, 5px) rotate(0deg)",
              }}
            />
          </div>
        </button>

        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 1198,
            opacity: menuOpen ? 1 : 0,
            pointerEvents: menuOpen ? "auto" : "none",
            transition: "opacity 0.25s ease",
          }}
        />

        <div
          style={{
            width: "220px",
            maxWidth: "85vw",
            background: "#0f172a",
            color: "white",
            padding: "20px",
            height: "100vh",
            position: "fixed",
            top: 0,
            right: menuOpen ? 0 : "-260px",
            zIndex: 1199,
            transition: "right 0.25s ease",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <h2 style={{ marginTop: 0 }}>{t("dashboard")}</h2>

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

          <div style={{ marginTop: "24px" }}>
            <LanguageSwitcher />
          </div>
        </div>
      </>
    );
  }

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
        boxSizing: "border-box",
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