import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../context/LanguageContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AreasList() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  const loadItems = () => {
    fetch(`${API}/properties`)
      .then((r) => r.json())
      .then(setItems)
      .catch((err) => console.error("Failed to load properties:", err));
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDelete = async (ku) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${ku}?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${API}/property/${encodeURIComponent(ku)}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete area");
        return;
      }

      setItems((prev) => prev.filter((item) => item.ku !== ku));
      alert(`${ku} deleted successfully`);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete area");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: isMobile ? "14px" : "20px",
          minWidth: 0,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: isMobile ? "1.4rem" : "1.5rem",
          }}
        >
          {t("distributionAreas")}
        </h2>

        {items.map((a) => (
          <div
            key={a._id}
            style={{
              border: "1px solid #ddd",
              padding: isMobile ? "14px" : "10px",
              marginBottom: "10px",
              borderRadius: "8px",
              background: "#fff",
            }}
          >
            <p style={{ wordBreak: "break-word" }}>
              <strong>{t("name")} :</strong> {a.ku}
            </p>
            <p style={{ wordBreak: "break-word" }}>
              <strong>{t("propertyDescription")} :</strong> {a.property}
            </p>
            <p style={{ wordBreak: "break-word" }}>
              <strong>{t("price")} :</strong> ¥{Number(a.calculatedPrice || a.price || 0).toLocaleString()}
            </p>
            <p style={{ wordBreak: "break-word" }}>
              <strong>{t("propertyCountLabel")} :</strong> {Number(a.count || 0).toLocaleString()} {t("units")}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "10px" : "0",
                marginTop: "10px",
              }}
            >
              <button
                onClick={() => navigate(`/admin/show/${a.ku}`)}
                style={{
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {t("show")}
              </button>

              <button
                onClick={() => navigate(`/admin/update/${a.ku}`)}
                style={{
                  marginLeft: isMobile ? "0" : "10px",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {t("update")}
              </button>

              <button
                onClick={() => handleDelete(a.ku)}
                style={{
                  marginLeft: isMobile ? "0" : "10px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  cursor: "pointer",
                  borderRadius: "4px",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}