import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MapEditorPanel({ onSaved, initialData }) {
  const { t } = useLanguage();

  const [ku, setKu] = useState("");
  const [property, setProperty] = useState("");
  const [count, setCount] = useState("");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (initialData) {
      setKu(initialData.ku || "");
      setProperty(initialData.property || "");
      setCount(initialData.count ?? "");
    }
  }, [initialData]);

  const isValid = useMemo(() => {
    return ku.trim() !== "" && property.trim() !== "" && count !== "";
  }, [ku, property, count]);

  const loadItems = async () => {
    try {
      const res = await fetch(`${API}/properties`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setStatus("Failed to load items");
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSave = async () => {
    if (!isValid) return;

    try {
      const res = await fetch(`${API}/property`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ku: ku.trim(),
          property: property.trim(),
          count: Number(count),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.message || "Save failed");
        return;
      }

      setStatus(`Saved: ${ku}`);

      if (!initialData) {
        setKu("");
        setProperty("");
        setCount("");
      }

      await loadItems();
      onSaved?.();
    } catch (err) {
      console.error(err);
      setStatus("Save error");
    }
  };

  const handleDelete = async (targetKu) => {
    try {
      await fetch(`${API}/property/${encodeURIComponent(targetKu)}`, {
        method: "DELETE",
      });
      await loadItems();
      onSaved?.();
    } catch (err) {
      console.error(err);
      setStatus("Delete error");
    }
  };

  return (
    <div
      style={{
        padding: isMobile ? "16px" : "20px",
        borderLeft: isMobile ? "none" : "1px solid #ddd",
        borderTop: isMobile ? "1px solid #ddd" : "none",
        width: isMobile ? "100%" : "350px",
        minWidth: isMobile ? "100%" : "350px",
        maxWidth: "100%",
        overflowY: "auto",
        background: "#fff",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          fontSize: isMobile ? "1.2rem" : "1.5rem",
        }}
      >
        {initialData ? t("updateMap") : t("addNewArea")}
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: "#f8fafc",
          padding: isMobile ? "14px" : "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <label style={{ fontWeight: "bold" }}>{t("choumeName")}</label>
        <input
          value={ku}
          onChange={(e) => setKu(e.target.value)}
          placeholder="e.g. Area 28"
          style={{
            padding: "10px",
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "16px",
          }}
          disabled={!!initialData}
        />

        <label style={{ fontWeight: "bold" }}>{t("propertyDescription")}</label>
        <input
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          placeholder="Apartment"
          style={{
            padding: "10px",
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "16px",
          }}
        />

        <label style={{ fontWeight: "bold" }}>{t("totalUnitsLabel")}</label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          style={{
            padding: "10px",
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "16px",
          }}
        />

        <button
          onClick={handleSave}
          disabled={!isValid}
          style={{
            background: !isValid ? "#f1a9c4" : "#be185d",
            color: "white",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            cursor: !isValid ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            marginTop: "6px",
          }}
        >
          {initialData ? t("updateMap") : t("saveToMap")}
        </button>

        {status && (
          <p
            style={{
              fontSize: "0.9rem",
              color: "#2563eb",
              margin: 0,
              wordBreak: "break-word",
            }}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}