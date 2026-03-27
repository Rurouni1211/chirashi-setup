import { useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "../context/LanguageContext";
import UserTopBar from "../components/UserTopBar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function MapInteractionWatcher({ geoJsonRef, isMapMovingRef }) {
  const map = useMap();

  useEffect(() => {
    const closeAllTooltips = () => {
      const layers = geoJsonRef.current?.getLayers?.() || [];
      layers.forEach((layer) => {
        layer.closeTooltip?.();
      });
    };

    const handleMoveStart = () => {
      isMapMovingRef.current = true;
      closeAllTooltips();
    };

    const handleDragStart = () => {
      isMapMovingRef.current = true;
      closeAllTooltips();
    };

    const handleZoomStart = () => {
      isMapMovingRef.current = true;
      closeAllTooltips();
    };

    const handleMoveEnd = () => {
      setTimeout(() => {
        isMapMovingRef.current = false;
      }, 50);
    };

    const handleDragEnd = () => {
      setTimeout(() => {
        isMapMovingRef.current = false;
      }, 50);
    };

    const handleZoomEnd = () => {
      setTimeout(() => {
        isMapMovingRef.current = false;
      }, 50);
    };

    const handleMapClick = () => {
      closeAllTooltips();
    };

    map.on("movestart", handleMoveStart);
    map.on("dragstart", handleDragStart);
    map.on("zoomstart", handleZoomStart);
    map.on("moveend", handleMoveEnd);
    map.on("dragend", handleDragEnd);
    map.on("zoomend", handleZoomEnd);
    map.on("click", handleMapClick);

    return () => {
      map.off("movestart", handleMoveStart);
      map.off("dragstart", handleDragStart);
      map.off("zoomstart", handleZoomStart);
      map.off("moveend", handleMoveEnd);
      map.off("dragend", handleDragEnd);
      map.off("zoomend", handleZoomEnd);
      map.off("click", handleMapClick);
    };
  }, [map, geoJsonRef, isMapMovingRef]);

  return null;
}

export default function UserView({ refreshKey }) {
  const { t } = useLanguage();

  const [geoData, setGeoData] = useState(null);
  const [propertyMap, setPropertyMap] = useState({});
  const [selectedAreas, setSelectedAreas] = useState({});
  const [checkoutStatus, setCheckoutStatus] = useState("");

  const geoJsonRef = useRef(null);
  const isMapMovingRef = useRef(false);

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
                ...geo.properties,
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
      })
      .catch((err) => console.error("GeoJSON load error:", err));
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/properties`);
        const data = await res.json();

        const map = {};
        if (Array.isArray(data)) {
          data.forEach((item) => {
            if (item?.ku) map[item.ku.trim()] = item;
          });
        }

        setPropertyMap(map);
      } catch (err) {
        console.error("Failed to load property map:", err);
      }
    };

    load();
  }, [refreshKey]);

  const getName = (feature) => {
    const p = feature?.properties || {};
    return (p.ku || p.name || p.S_NAME || p.N03_004 || p.MOJI || "Unknown").trim();
  };

  const styleFeature = (feature) => {
    const name = getName(feature);
    const isSelected = !!selectedAreas[name];
    const adminData = propertyMap[name];

    return {
      color: isSelected ? "#be185d" : "#475569",
      weight: isSelected ? 3 : 1,
      fillColor: isSelected ? "#f472b6" : adminData ? "#86efac" : "#cbd5e1",
      fillOpacity: isSelected ? 0.85 : 0.6,
    };
  };

  const resetLayerStyle = (layer) => {
    if (geoJsonRef.current) {
      geoJsonRef.current.resetStyle(layer);
    }
  };

  const closeAllTooltips = () => {
    const layers = geoJsonRef.current?.getLayers?.() || [];
    layers.forEach((layer) => {
      layer.closeTooltip?.();
    });
  };

  const handleEachFeature = (feature, layer) => {
    const name = getName(feature);

    layer.bindTooltip(name, {
      sticky: false,
      direction: "top",
      className: "ward-tooltip",
      opacity: 0.9,
      offset: [0, -8],
    });

    layer.on({
      mouseover: (e) => {
        if (isMapMovingRef.current) return;

        closeAllTooltips();

        const target = e.target;
        const isSelected = !!selectedAreas[name];

        target.setStyle({
          weight: isSelected ? 3 : 1.5,
          color: isSelected ? "#be185d" : "#0f172a",
          fillOpacity: isSelected ? 0.85 : 0.85,
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          target.bringToFront();
        }

        target.openTooltip();
      },

      mouseout: (e) => {
        const target = e.target;
        resetLayerStyle(target);
        target.closeTooltip();
      },

      mousedown: (e) => {
        e.target.closeTooltip();
      },

      click: (e) => {
        L.DomEvent.stopPropagation(e);

        const target = e.target;
        closeAllTooltips();

        if (selectedAreas[name]) {
          const copy = { ...selectedAreas };
          delete copy[name];
          setSelectedAreas(copy);

          const layers = geoJsonRef.current?.getLayers?.() || [];
          layers.forEach((l) => resetLayerStyle(l));

          target.closeTooltip();
          const el = target.getElement?.();
          if (el) el.blur?.();
          return;
        }

        const adminData = propertyMap[name];

        if (!adminData) {
          console.warn(`Area "${name}" has no admin data. Ignoring click.`);
          target.closeTooltip();
          return;
        }

        setSelectedAreas((prev) => ({
          ...prev,
          [name]: {
            desc: adminData.property,
            price: Number(adminData.calculatedPrice ?? 0),
            baseQty: Number(adminData.count ?? 0),
            userQty: 1,
          },
        }));

        const layers = geoJsonRef.current?.getLayers?.() || [];
        layers.forEach((l) => resetLayerStyle(l));

        target.setStyle({
          color: "#be185d",
          weight: 3,
          fillColor: "#f472b6",
          fillOpacity: 0.85,
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          target.bringToFront();
        }

        target.closeTooltip();

        const el = target.getElement?.();
        if (el) {
          el.blur?.();
        }
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

  const handleCheckout = async () => {
    const entries = Object.entries(selectedAreas);
    if (!entries.length) {
      setCheckoutStatus(t("pleaseSelectArea"));
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCheckoutStatus(data.message || "Checkout failed");
        return;
      }

      setCheckoutStatus(t("checkoutSaved"));
      setSelectedAreas({});
    } catch (err) {
      console.error(err);
      setCheckoutStatus("Checkout failed");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "#f1f5f9",
        minHeight: "100vh",
      }}
    >
      <UserTopBar />

      <div
        style={{
          display: "flex",
          gap: "20px",
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

            <MapInteractionWatcher
              geoJsonRef={geoJsonRef}
              isMapMovingRef={isMapMovingRef}
            />

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
            {t("selectedAreas")}
          </h2>

          {Object.keys(selectedAreas).length === 0 && (
            <p style={{ color: "#64748b", marginTop: "20px" }}>
              {t("clickGreenArea")}
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
                <b>{t("type")}:</b> {data.desc}
              </p>

              <p style={{ margin: "4px 0" }}>
                <b>{t("unitPrice")}:</b> ¥{Number(data.price || 0).toLocaleString()}
              </p>

              <div style={{ marginTop: "12px" }}>
                <label>
                  <b>{t("adjustQuantity")}</b>
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
                  <span>
                    {data.userQty.toLocaleString()} {t("units")}
                  </span>
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
                {t("subtotal")}: ¥{(data.userQty * data.price).toLocaleString()}
              </p>
            </div>
          ))}

          {Object.keys(selectedAreas).length > 0 && (
  <div
    style={{
      position: "sticky",
      bottom: "-20px",
      marginTop: "20px",
      marginLeft: "-20px",
      marginRight: "-20px",
      marginBottom: "-20px",
      background: "white",
      borderTop: "2px solid #f1f5f9",
      padding: "20px",
      zIndex: 30,
      boxShadow: "0 -6px 12px rgba(0,0,0,0.04)",
    }}
  >
    <div style={{ marginBottom: "8px" }}>
      <b>{t("totalUnits")}:</b> {totalUnits.toLocaleString()}
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
        {t("totalAmount")}:
      </span>
      <span
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#be185d",
        }}
      >
        ¥{salesAmount.toLocaleString()}
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
      {t("confirmCheckout")}
    </button>

    {checkoutStatus && (
      <p style={{ marginTop: "12px", color: "#334155" }}>
        {checkoutStatus}
      </p>
    )}
  </div>
)}
        </div>
      </div>
    </div>
  );
}