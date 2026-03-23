import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MapEditorPanel({ onSaved, initialData }) {
  const [ku, setKu] = useState("");
  const [property, setProperty] = useState("");
  const [price, setPrice] = useState("");
  const [count, setCount] = useState("");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (initialData) {
      setKu(initialData.ku || "");
      setProperty(initialData.property || "");
      setPrice(initialData.price ?? "");
      setCount(initialData.count ?? "");
    }
  }, [initialData]);

  const isValid = useMemo(() => {
    return (
      ku.trim() !== "" &&
      property.trim() !== "" &&
      price !== "" &&
      count !== ""
    );
  }, [ku, property, price, count]);

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
          price: Number(price),
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
        setPrice("");
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
      <h2>{initialData ? "Update Area" : "Add New Area"}</h2>

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
        <label>Choume Name</label>
        <input
          value={ku}
          onChange={(e) => setKu(e.target.value)}
          placeholder="e.g. Area 28"
          style={{ padding: "8px" }}
          disabled={!!initialData}
        />

        <label>Property Description</label>
        <input
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          placeholder="Apartment"
          style={{ padding: "8px" }}
        />

        <label>Price Per Unit</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="e.g. 100"
          style={{ padding: "8px" }}
        />

        <label>Total Units</label>
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
          {initialData ? "Update Map" : "Save to Map"}
        </button>

        {status && (
          <p style={{ fontSize: "0.8rem", color: "blue", margin: 0 }}>
            {status}
          </p>
        )}
      </div>

      <h3 style={{ marginBottom: "10px" }}>Saved Areas</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.length === 0 && (
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            No saved areas yet.
          </p>
        )}

        {items.map((item) => (
          <div
            key={item._id || item.ku}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "10px",
              background: "#f8fafc",
            }}
          >
            <strong>{item.ku}</strong>
            <p style={{ margin: "6px 0" }}>{item.property}</p>
            <p style={{ margin: "6px 0", color: "#475569" }}>
              Price: ¥{Number(item.price || 0).toLocaleString()}
            </p>
            <p style={{ margin: "6px 0", color: "#475569" }}>
              {item.count} units
            </p>

            <button
              onClick={() => handleDelete(item.ku)}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}