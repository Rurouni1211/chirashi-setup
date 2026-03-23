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
        padding: "20px",
        borderLeft: "1px solid #ddd",
        width: "350px",
        overflowY: "auto",
        background: "#fff",
      }}
    >
      <h2>{initialData ? t("updateMap") : t("addNewArea")}</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: "#f8fafc",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <label>{t("choumeName")}</label>
        <input
          value={ku}
          onChange={(e) => setKu(e.target.value)}
          placeholder="e.g. Area 28"
          style={{ padding: "8px" }}
          disabled={!!initialData}
        />

        <label>{t("propertyDescription")}</label>
        <input
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          placeholder="Apartment"
          style={{ padding: "8px" }}
        />

        <label>{t("totalUnitsLabel")}</label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          style={{ padding: "8px" }}
        />

        <button
          onClick={handleSave}
          disabled={!isValid}
          style={{
            background: "#be185d",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {initialData ? t("updateMap") : t("saveToMap")}
        </button>

        {status && (
          <p style={{ fontSize: "0.8rem", color: "blue", margin: 0 }}>
            {status}
          </p>
        )}
      </div>

    
    </div>
  );
}