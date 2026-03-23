import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../context/LanguageContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AreasList() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
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
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "20px" }}>
        <h2>{t("distributionAreas")}</h2>

        {items.map((a) => (
          <div
            key={a._id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <p><strong>{t("name")} :</strong> {a.ku}</p>
            <p><strong>{t("propertyDescription")} :</strong> {a.property}</p>
            <p><strong>{t("price")} :</strong> ¥{Number(a.calculatedPrice || a.price || 0).toLocaleString()}</p>
            <p><strong>{t("propertyCountLabel")} :</strong> {Number(a.count || 0).toLocaleString()} {t("units")}</p>

            <button onClick={() => navigate(`/admin/show/${a.ku}`)}>
              {t("show")}
            </button>

            <button
              onClick={() => navigate(`/admin/update/${a.ku}`)}
              style={{ marginLeft: "10px" }}
            >
              {t("update")}
            </button>

            <button
              onClick={() => handleDelete(a.ku)}
              style={{
                marginLeft: "10px",
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "6px 12px",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              {t("delete")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}