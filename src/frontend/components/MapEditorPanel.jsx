import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

//const API_BASE = "http://localhost:5000";

export default function MapEditorPanel({ onSaved, initialData }) {
  const [ku, setKu] = useState("");
  const [property, setProperty] = useState("");
  const [count, setCount] = useState("");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");

  const UNIT_PRICE = 100;

  // Carry information from existing data if available
  useEffect(() => {
    if (initialData) {
      setKu(initialData.ku || "");
      setProperty(initialData.property || "");
      setCount(initialData.count || "");
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
    } catch (err) { setStatus("Failed to load items"); }
  };

  useEffect(() => { loadItems(); }, []);

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
          price: UNIT_PRICE,
        }),
      });
      if (res.ok) {
        setStatus(`Saved: ${ku}`);
        if (!initialData) { // Only clear if it's a "New" entry
          setKu(""); setProperty(""); setCount("");
        }
        await loadItems();
        onSaved?.();
      }
    } catch (err) { setStatus("Save error"); }
  };

  const handleDelete = async (targetKu) => {
    await fetch(`${API}/property/${encodeURIComponent(targetKu)}`, { method: "DELETE" });
    await loadItems();
    onSaved?.();
  };

  return (
    <div style={{ padding: "20px", borderLeft: "1px solid #ddd", width: "350px" }}>
      <h2>{initialData ? "Update Area" : "Add New Area"}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "#f8fafc", padding: "15px", borderRadius: "8px" }}>
        <label>Choume Name</label>
        <input 
          value={ku} 
          onChange={(e) => setKu(e.target.value)} 
          placeholder="e.g. Area 28" 
          style={{ padding: "8px" }} 
          disabled={!!initialData} // Usually Choume name is the ID, so disable editing it on update
        />
        
        <label>Property Description</label>
        <input value={property} onChange={(e) => setProperty(e.target.value)} placeholder="Apartment" style={{ padding: "8px" }} />
        
        <label>Total Units</label>
        <input type="number" value={count} onChange={(e) => setCount(e.target.value)} style={{ padding: "8px" }} />
        
        <button onClick={handleSave} disabled={!isValid} style={{ background: "#be185d", color: "white", padding: "10px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          {initialData ? "Update Map" : "Save to Map"}
        </button>
        {status && <p style={{ fontSize: "0.8rem", color: "blue" }}>{status}</p>}
      </div>
      {/* ... rest of the list rendering ... */}
    </div>
  );
}