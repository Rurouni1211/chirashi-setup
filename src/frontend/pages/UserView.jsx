import { useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function UserView({ refreshKey }) {
  const [geoData, setGeoData] = useState(null);
  const [propertyMap, setPropertyMap] = useState({});
  const [selectedAreas, setSelectedAreas] = useState({});
  const [gasFee, setGasFee] = useState("0");
  const [avgMinutesNeeded, setAvgMinutesNeeded] = useState("60");
  const [hourlyRate, setHourlyRate] = useState("1000");
  const [checkoutStatus, setCheckoutStatus] = useState("");

  const geoJsonRef = useRef(null);

  useEffect(() => {
    fetch("/wards.geojson")
      .then((res) => res.json())
      .then((data) => {
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
                  `Area ${i}`,
              },
            })),
          };
          setGeoData(converted);
        } else {
          setGeoData(data);
        }
      });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/properties`);
        const data = await res.json();

        const map = {};
        data.forEach((item) => {
          if (item.ku) map[item.ku.trim()] = item;
        });
        setPropertyMap(map);
      } catch (err) {
        console.error("Failed to load property map:", err);
      }
    };

    load();
  }, [refreshKey]);

  const getName = (feature) => {
    const p = feature?.properties;
    return (p?.ku || p?.name || p?.S_NAME || p?.MOJI || "Unknown").trim();
  };

  const styleFeature = (feature) => {
    const name = getName(feature);
    const isSelected = selectedAreas[name];
    const adminData = propertyMap[name];

    return {
      color: isSelected ? "#be185d" : "#475569",
      weight: isSelected ? 3 : 1,
      fillColor: isSelected ? "#f472b6" : adminData ? "#86efac" : "#cbd5e1",
      fillOpacity: isSelected ? 0.85 : 0.6,
    };
  };

  const handleEachFeature = (feature, layer) => {
    const name = getName(feature);

    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);

        if (selectedAreas[name]) {
          const copy = { ...selectedAreas };
          delete copy[name];
          setSelectedAreas(copy);
          return;
        }

        const adminData = propertyMap[name];

        if (!adminData) {
          console.warn(`Area "${name}" has no admin data. Ignoring click.`);
          return;
        }

        setSelectedAreas((prev) => ({
          ...prev,
          [name]: {
            desc: adminData.property,
            price: adminData.price ?? 1,
            baseQty: adminData.count ?? 0,
            userQty: 1,
          },
        }));
      },
    });
  };

  const updateQty = (area, qty) => {
    const adminMax = selectedAreas[area].baseQty;
    if (qty > adminMax) qty = adminMax;
    if (qty < 1) qty = 1;

    setSelectedAreas((prev) => ({
      ...prev,
      [area]: { ...prev[area], userQty: qty },
    }));
  };

  const totalUnits = Object.values(selectedAreas).reduce(
    (sum, a) => sum + a.userQty,
    0
  );

  const salesAmount = Object.values(selectedAreas).reduce(
    (sum, a) => sum + a.userQty * a.price,
    0
  );

  const laborHours = Number(avgMinutesNeeded || 0) / 60;
  const laborCost = laborHours * Number(hourlyRate || 0);
  const investmentAmount = Number(gasFee || 0) + laborCost;
  const profit = salesAmount - investmentAmount;
  const revenuePerHour = laborHours > 0 ? salesAmount / laborHours : 0;

  const handleCheckout = async () => {
    const entries = Object.entries(selectedAreas);
    if (!entries.length) {
      setCheckoutStatus("Please select at least one area.");
      return;
    }

    try {
      const items = entries.map(([name, data]) => ({
        area: name,
        desc: data.desc,
        unitPrice: Number(data.price || 0),
        qty: Number(data.userQty || 0),
      }));

      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          gasFee: Number(gasFee || 0),
          avgMinutesNeeded: Number(avgMinutesNeeded || 0),
          hourlyRate: Number(hourlyRate || 0),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCheckoutStatus(data.message || "Checkout failed");
        return;
      }

      setCheckoutStatus("Checkout saved successfully");
      setSelectedAreas({});
      setGasFee("0");
      setAvgMinutesNeeded("60");
      setHourlyRate("1000");
    } catch (err) {
      console.error(err);
      setCheckoutStatus("Checkout failed");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
        background: "#f1f5f9",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          flex: 1,
          background: "white",
          padding: "10px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        }}
      >
        <MapContainer
          center={[34.6944, 135.1948]}
          zoom={14}
          style={{ height: "750px", borderRadius: "8px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {geoData && (
            <GeoJSON
              key={
                JSON.stringify(Object.keys(selectedAreas)) +
                JSON.stringify(Object.keys(propertyMap))
              }
              data={geoData}
              style={styleFeature}
              onEachFeature={handleEachFeature}
              ref={geoJsonRef}
            />
          )}
        </MapContainer>
      </div>

      <div
        style={{
          width: "440px",
          position: "sticky",
          top: "20px",
          height: "90vh",
          overflowY: "auto",
          background: "white",
          border: "1px solid #e2e8f0",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        }}
      >
        <h2 style={{ borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>
          Selected Areas
        </h2>

        {Object.keys(selectedAreas).length === 0 && (
          <p style={{ color: "#64748b", marginTop: "20px" }}>
            Click a <strong>green area</strong> on the map to add to your order.
          </p>
        )}

        {Object.entries(selectedAreas).map(([name, data]) => (
          <div
            key={name}
            style={{
              border: "1px solid #f1f5f9",
              padding: "15px",
              marginBottom: "12px",
              borderRadius: "8px",
              background: "#f8fafc",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong style={{ fontSize: "1.1rem" }}>{name}</strong>
              <button
                onClick={() => {
                  const copy = { ...selectedAreas };
                  delete copy[name];
                  setSelectedAreas(copy);
                }}
                style={{
                  border: "none",
                  background: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: "8px 0" }}>
              <b>Type:</b> {data.desc}
            </p>
            <p style={{ margin: "4px 0" }}>
              <b>Unit Price:</b> ¥{Number(data.price).toLocaleString()}
            </p>

            <div style={{ marginTop: "12px" }}>
              <label>
                <b>Adjust Quantity</b>
              </label>
              <input
                type="range"
                min="1"
                max={data.baseQty}
                value={data.userQty}
                onChange={(e) => updateQty(name, Number(e.target.value))}
                style={{ width: "100%", accentColor: "#be185d" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                }}
              >
                <span>{data.userQty.toLocaleString()} units</span>
                <span>Max: {data.baseQty.toLocaleString()}</span>
              </div>
            </div>

            <p
              style={{
                marginTop: "10px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              Subtotal: ¥{(data.userQty * data.price).toLocaleString()}
            </p>
          </div>
        ))}

        {Object.keys(selectedAreas).length > 0 && (
          <>
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "10px",
                padding: "15px",
                marginTop: "15px",
                marginBottom: "15px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Cost Settings</h3>

              <label style={{ display: "block", marginBottom: "6px" }}>
                Gas Fee
              </label>
              <input
                type="number"
                value={gasFee}
                onChange={(e) => setGasFee(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
              />

              <label style={{ display: "block", marginBottom: "6px" }}>
                Average Minutes Needed
              </label>
              <input
                type="number"
                value={avgMinutesNeeded}
                onChange={(e) => setAvgMinutesNeeded(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
              />

              <label style={{ display: "block", marginBottom: "6px" }}>
                Hourly Rate
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div
              style={{
                borderTop: "2px solid #f1f5f9",
                paddingTop: "20px",
                marginTop: "20px",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <b>Total Units:</b> {totalUnits.toLocaleString()}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <b>Sales Amount:</b> ¥{salesAmount.toLocaleString()}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <b>Gas Fee:</b> ¥{Number(gasFee).toLocaleString()}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <b>Labor Hours:</b> {laborHours.toFixed(2)}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <b>Labor Cost:</b> ¥{laborCost.toLocaleString()}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <b>Investment:</b> ¥{investmentAmount.toLocaleString()}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <b>Revenue / Hour:</b> ¥{revenuePerHour.toFixed(0)}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "16px",
                  marginBottom: "20px",
                }}
              >
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  Profit:
                </span>
                <span
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: profit >= 0 ? "#16a34a" : "#dc2626",
                  }}
                >
                  ¥{profit.toLocaleString()}
                </span>
              </div>

              <button
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "#be185d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={handleCheckout}
              >
                Confirm Checkout
              </button>

              {checkoutStatus && (
                <p style={{ marginTop: "12px", color: "#334155" }}>
                  {checkoutStatus}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}