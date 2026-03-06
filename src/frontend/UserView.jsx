import { useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = "https://chirashi-setup.onrender.com";

export default function UserView({ refreshKey }) {

  const [geoData, setGeoData] = useState(null);
  const [propertyMap, setPropertyMap] = useState({});
  const [selectedAreas, setSelectedAreas] = useState({});

  const geoJsonRef = useRef(null);

  // Load GeoJSON
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
                name:
                  geo.properties?.name ||
                  geo.properties?.S_NAME ||
                  geo.properties?.MOJI ||
                  `Area ${i}`
              }
            }))
          };

          setGeoData(converted);

        } else {

          setGeoData(data);

        }

      });

  }, []);

  // Load admin properties
  useEffect(() => {

    const load = async () => {

      const res = await fetch(`${API_BASE}/properties`);
      const data = await res.json();
console.log("SERVER DATA:", data);

      const map = {};

      data.forEach(item => {
        map[item.ku] = item;
      });

      setPropertyMap(map);

    };

    load();

  }, [refreshKey]);

  const getName = (feature) =>
    feature.properties.name || feature.properties.S_NAME || "Unknown";

  // Map coloring
  const styleFeature = (feature) => {

    const name = getName(feature);
    const isSelected = selectedAreas[name];
    const adminData = propertyMap[name];

    return {
      color: isSelected ? "#be185d" : "#475569",
      weight: isSelected ? 3 : 1,
      fillColor: isSelected
        ? "#f472b6"
        : adminData
        ? "#86efac"
        : "#cbd5e1",
      fillOpacity: isSelected ? 0.85 : 0.6
    };

  };

  // Ward click logic
  const handleEachFeature = (feature, layer) => {

    const name = getName(feature);

    layer.on({

      click: async (e) => {

        L.DomEvent.stopPropagation(e);

        // If already selected → remove
        if (selectedAreas[name]) {

          const copy = { ...selectedAreas };
          delete copy[name];
          setSelectedAreas(copy);
          return;

        }

        try {

          const res = await fetch(
            `${API_BASE}/property/${encodeURIComponent(name)}`
          );

          if (!res.ok) return;

          const data = await res.json();

          setSelectedAreas(prev => ({
            ...prev,
            [name]: {
              desc: data.property,
              price: data.price,
              baseQty: data.count ?? data.units ?? 0,
userQty: data.count ?? data.units ?? 0,
            }
          }));

        } catch (err) {

          console.error(err);

        }

      }

    });

  };

  // Update quantity but prevent exceeding admin units
  const updateQty = (area, qty) => {

    const adminMax = selectedAreas[area].baseQty;

    if (qty > adminMax) qty = adminMax;
    if (qty < 1) qty = 1;

    setSelectedAreas(prev => ({
      ...prev,
      [area]: {
        ...prev[area],
        userQty: qty
      }
    }));

  };

  // Total price
  const totalPrice = Object.values(selectedAreas).reduce(
    (sum, a) => sum + (a.userQty * a.price),
    0
  );

  return (

    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>

      {/* MAP */}

      <div style={{ flex: 1 }}>

        <MapContainer
          center={[34.6944, 135.1948]}
          zoom={14}
          style={{ height: "750px" }}
        >

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {geoData && (

            <GeoJSON
              key={JSON.stringify(Object.keys(selectedAreas))}
              data={geoData}
              style={styleFeature}
              onEachFeature={handleEachFeature}
              ref={geoJsonRef}
            />

          )}

        </MapContainer>

      </div>

      {/* SIDEBAR */}

      <div
        style={{
          width: "420px",
          position: "sticky",
          top: "20px",
          height: "90vh",
          overflowY: "auto",
          background: "white",
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px"
        }}
      >

        <h2>Selected Choume</h2>

        {Object.keys(selectedAreas).length === 0 && (
          <p style={{ color: "#64748b" }}>
            Click a choume on the map to add.
          </p>
        )}

        {Object.entries(selectedAreas).map(([name, data]) => (

          <div
            key={name}
            style={{
              border: "1px solid #eee",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "6px"
            }}
          >

            <div style={{ display: "flex", justifyContent: "space-between" }}>

              <strong>{name}</strong>

              <button
                onClick={() => {
                  const copy = { ...selectedAreas };
                  delete copy[name];
                  setSelectedAreas(copy);
                }}
                style={{
                  border: "none",
                  background: "none",
                  color: "red",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>

            </div>

            <p><b>Type:</b> {data.desc}</p>

            <p><b>Unit Price:</b> ¥{data.price}</p>

            <p><b>Admin Units:</b> {data.baseQty}</p>

            <div>

              <label><b>User Units</b></label>

              <input
                type="range"
                min="1"
                max={data.baseQty}
                value={data.userQty}
                onChange={(e) =>
                  updateQty(name, Number(e.target.value))
                }
                style={{ width: "100%" }}
              />

              <p>{data.userQty} / {data.baseQty}</p>

            </div>

            <p>
              <b>Subtotal:</b> ¥
              {(data.userQty * data.price).toLocaleString()}
            </p>

          </div>

        ))}

        {Object.keys(selectedAreas).length > 0 && (

          <div style={{ borderTop: "2px solid #eee", paddingTop: "15px" }}>

            <h3>Total: ¥{totalPrice.toLocaleString()}</h3>

            <button
              style={{
                width: "100%",
                padding: "12px",
                background: "#be185d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
              onClick={() =>
                alert(`Total Order: ¥${totalPrice.toLocaleString()}`)
              }
            >
              Checkout
            </button>

          </div>

        )}

      </div>

    </div>

  );

}