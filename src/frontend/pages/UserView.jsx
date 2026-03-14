import { useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

//const API_BASE = "http://localhost:5000";

export default function UserView({ refreshKey }) {
  const [geoData, setGeoData] = useState(null);
  const [propertyMap, setPropertyMap] = useState({});
  const [selectedAreas, setSelectedAreas] = useState({});

  const geoJsonRef = useRef(null);

  // 1. Load GeoJSON and handle potential GeometryCollection format
  useEffect(() => {
    fetch("/wards.geojson")
      .then(res => res.json())
      .then(data => {
        if (data.type === "GeometryCollection") {
          const converted = {
            type: "FeatureCollection",
            features: data.geometries.map((geo, i) => ({
              type: "Feature",
              id: i,
              geometry: geo,
              properties: {
                name: geo.properties?.name || geo.properties?.S_NAME || geo.properties?.MOJI || `Area ${i}`
              }
            }))
          };
          setGeoData(converted);
        } else {
          setGeoData(data);
        }
      });
  }, []);

  // 2. Load all admin properties into a local map for instant lookup
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/properties`);
        const data = await res.json();
        
        const map = {};
        data.forEach(item => {
          // Trim to ensure "渦森台四丁目" matches exactly
          if (item.ku) map[item.ku.trim()] = item;
        });
        setPropertyMap(map);
      } catch (err) {
        console.error("Failed to load property map:", err);
      }
    };
    load();
  }, [refreshKey]);

  // Helper to extract the name used for matching
  const getName = (feature) => {
    const p = feature?.properties;
    return (p?.ku || p?.name || p?.S_NAME || p?.MOJI || "Unknown").trim();
  };

  // 3. Dynamic Map Coloring
  const styleFeature = (feature) => {
    const name = getName(feature);
    const isSelected = selectedAreas[name];
    const adminData = propertyMap[name];

    return {
      color: isSelected ? "#be185d" : "#475569",
      weight: isSelected ? 3 : 1,
      fillColor: isSelected
        ? "#f472b6"      // Pink if selected
        : adminData
        ? "#86efac"      // Green if it has admin data (Shoppable)
        : "#cbd5e1",     // Gray if empty
      fillOpacity: isSelected ? 0.85 : 0.6
    };
  };

  // 4. Ward Selection Logic
  const handleEachFeature = (feature, layer) => {
    const name = getName(feature);

    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);

        // Toggle off if already selected
        if (selectedAreas[name]) {
          const copy = { ...selectedAreas };
          delete copy[name];
          setSelectedAreas(copy);
          return;
        }

        // Check local propertyMap first to avoid 404 errors
        const adminData = propertyMap[name];
        
        if (!adminData) {
          console.warn(`Area "${name}" has no admin data. Ignoring click.`);
          return; 
        }

        // Add to sidebar using data we already have
        setSelectedAreas(prev => ({
          ...prev,
          [name]: {
            desc: adminData.property,
            price: adminData.price,
            baseQty: adminData.count ?? 0,
            userQty: adminData.count ?? 0, 
          }
        }));
      }
    });
  };

  // 5. Quantity Adjustment
  const updateQty = (area, qty) => {
    const adminMax = selectedAreas[area].baseQty;
    if (qty > adminMax) qty = adminMax;
    if (qty < 1) qty = 1;

    setSelectedAreas(prev => ({
      ...prev,
      [area]: { ...prev[area], userQty: qty }
    }));
  };

  // Calculate total for checkout
  const totalPrice = Object.values(selectedAreas).reduce(
    (sum, a) => sum + (a.userQty * a.price),
    0
  );

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px", background: "#f1f5f9", minHeight: "100vh" }}>
      
      {/* LEFT: INTERACTIVE MAP */}
      <div style={{ flex: 1, background: "white", padding: "10px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
        <MapContainer center={[34.6944, 135.1948]} zoom={14} style={{ height: "750px", borderRadius: "8px" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {geoData && (
            <GeoJSON
              key={JSON.stringify(Object.keys(selectedAreas)) + JSON.stringify(Object.keys(propertyMap))}
              data={geoData}
              style={styleFeature}
              onEachFeature={handleEachFeature}
              ref={geoJsonRef}
            />
          )}
        </MapContainer>
      </div>

      {/* RIGHT: SHOPPING SIDEBAR */}
      <div style={{ width: "420px", position: "sticky", top: "20px", height: "90vh", overflowY: "auto", background: "white", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}>
        <h2 style={{ borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>Selected Areas</h2>

        {Object.keys(selectedAreas).length === 0 && (
          <p style={{ color: "#64748b", marginTop: "20px" }}>
            Click a <strong>green area</strong> on the map to add to your order.
          </p>
        )}

        {Object.entries(selectedAreas).map(([name, data]) => (
          <div key={name} style={{ border: "1px solid #f1f5f9", padding: "15px", marginBottom: "12px", borderRadius: "8px", background: "#f8fafc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "1.1rem" }}>{name}</strong>
              <button onClick={() => {
                const copy = { ...selectedAreas };
                delete copy[name];
                setSelectedAreas(copy);
              }} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>

            <p style={{ margin: "8px 0" }}><b>Type:</b> {data.desc}</p>
            <p style={{ margin: "4px 0" }}><b>Unit Price:</b> ¥{data.price}</p>

            <div style={{ marginTop: "12px" }}>
              <label><b>Adjust Quantity</b></label>
              <input type="range" min="1" max={data.baseQty} value={data.userQty} onChange={(e) => updateQty(name, Number(e.target.value))} style={{ width: "100%", accentColor: "#be185d" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span>{data.userQty.toLocaleString()} units</span>
                <span>Max: {data.baseQty.toLocaleString()}</span>
              </div>
            </div>

            <p style={{ marginTop: "10px", textAlign: "right", fontWeight: "bold" }}>
              Subtotal: ¥{(data.userQty * data.price).toLocaleString()}
            </p>
          </div>
        ))}

        {Object.keys(selectedAreas).length > 0 && (
          <div style={{ borderTop: "2px solid #f1f5f9", paddingTop: "20px", marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Total Amount:</span>
              <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#be185d" }}>¥{totalPrice.toLocaleString()}</span>
            </div>

            <button
              style={{ width: "100%", padding: "16px", background: "#be185d", color: "white", border: "none", borderRadius: "8px", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }}
              onClick={() => alert(`Order Confirmed!\nTotal: ¥${totalPrice.toLocaleString()}`)}
            >
              Confirm Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}