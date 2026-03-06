import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:5000";

export default function AdminDashboard({ onSaved }) {
  const [ku, setKu] = useState("");
  const [property, setProperty] = useState("");
  const [count, setCount] = useState("");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");

  const UNIT_PRICE = 100;

  const isValid = useMemo(() => {
    return ku.trim() !== "" && property.trim() !== "" && count !== "";
  }, [ku, property, count]);

  const loadItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/properties`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { setStatus("Failed to load items"); }
  };

  useEffect(() => { loadItems(); }, []);

  const handleSave = async () => {
    if (!isValid) return;
    try {
      const res = await fetch(`${API_BASE}/property`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ku: ku.trim(),
          property: property.trim(),
          count: Number(count),
          price: UNIT_PRICE,
        }),
      });
      if (res.ok) {
        setStatus(`Saved: ${ku}`);
        setKu(""); setProperty(""); setCount("");
        await loadItems();
        onSaved?.();
      }
    } catch (err) { setStatus("Save error"); }
  };

  const handleDelete = async (targetKu) => {
    await fetch(`${API_BASE}/property/${encodeURIComponent(targetKu)}`, { method: "DELETE" });
    await loadItems();
    onSaved?.();
  };

  return (
    <div style={{ padding: "20px", borderRight: "1px solid #ddd" }}>
      <h2>Admin Panel</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "#f8fafc", padding: "15px", borderRadius: "8px" }}>
        <label>Choume Name (Exact match from console)</label>
        <input value={ku} onChange={(e) => setKu(e.target.value)} placeholder="e.g. Area 28" style={{ padding: "8px" }} />
        
        <label>Property Description</label>
        <input value={property} onChange={(e) => setProperty(e.target.value)} placeholder="Apartment" style={{ padding: "8px" }} />
        
        <label>Initial Units</label>
        <input type="number" value={count} onChange={(e) => setCount(e.target.value)} style={{ padding: "8px" }} />
        
        <button onClick={handleSave} disabled={!isValid} style={{ background: "#be185d", color: "white", padding: "10px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Save to Map
        </button>
        {status && <p style={{ fontSize: "0.8rem", color: "blue" }}>{status}</p>}
      </div>

      <h3 style={{ marginTop: "20px" }}>Stored Choume</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map(item => (
          <div key={item._id} style={{ display: "flex", justifyContent: "space-between", background: "#fff", padding: "10px", border: "1px solid #eee" }}>
            <span><strong>{item.ku}</strong> ({item.count} units)</span>
            <button onClick={() => handleDelete(item.ku)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}