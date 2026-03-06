import { useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = "https://chirashi-setup.onrender.com";

export default function MapView({ refreshKey }) {
  const [geoData, setGeoData] = useState(null);
  const [propertyMap, setPropertyMap] = useState({});
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [highlightedWard, setHighlightedWard] = useState(null);
  
  // User interaction state
  const [userCount, setUserCount] = useState(1);

  const geoJsonRef = useRef(null);

  // 1. Load GeoJSON and convert if necessary
  useEffect(() => {
    fetch("/wards.geojson")
      .then((res) => res.json())
      .then((data) => {
        if (data.type === "GeometryCollection") {
          const converted = {
            type: "FeatureCollection",
            features: data.geometries.map((geo, idx) => ({
              type: "Feature",
              id: idx,
              geometry: geo,
              properties: {
                name: geo.properties?.name || geo.properties?.S_NAME || `Area ${idx}`
              }
            }))
          };
          setGeoData(converted);
        } else {
          setGeoData(data);
        }
      })
      .catch((err) => console.error("GeoJSON error:", err));
  }, []);

  // 2. Load admin settings
  useEffect(() => {
    loadProperties();
  }, [refreshKey]);

  const loadProperties = async () => {
    try {
      const res = await fetch(`${API_BASE}/properties`);
      const data = await res.json();
      const map = {};
      data.forEach(item => { map[item.ku] = item; });
      setPropertyMap(map);
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Sync Styles manually on state change
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.eachLayer((layer) => {
        const style = styleFeature(layer.feature);
        layer.setStyle(style);
        if (getWardName(layer.feature) === highlightedWard) {
          layer.bringToFront();
        }
      });
    }
  }, [highlightedWard, propertyMap]);

  const getWardName = (feature) => {
    const p = feature.properties;
    return p.name || p.S_NAME || p.N03_004 || "Unknown";
  };

  const styleFeature = (feature) => {
    const name = getWardName(feature);
    const isHighlighted = name === highlightedWard;
    const hasData = propertyMap[name];

    return {
      color: isHighlighted ? "#be185d" : "#475569",
      weight: isHighlighted ? 3 : 1,
      fillColor: isHighlighted ? "#f472b6" : (hasData ? "#86efac" : "#cbd5e1"),
      fillOpacity: isHighlighted ? 0.8 : 0.6,
    };
  };

  const handleEachFeature = (feature, layer) => {
    const kuName = getWardName(feature);

    layer.on({
      click: async (e) => {
        L.DomEvent.stopPropagation(e);
        setHighlightedWard(kuName);

        try {
          const res = await fetch(`${API_BASE}/property/${encodeURIComponent(kuName)}`);
          const data = await res.json();

          if (res.ok) {
            setSelectedInfo({
              ku: kuName,
              property: data.property,
              unitPrice: data.price, // ¥100
              adminDefaultCount: data.count,
              latlng: e.latlng || layer.getBounds().getCenter(),
            });
            // Set user count to the admin default initially
            setUserCount(data.count);
          } else {
            setSelectedInfo(null);
          }
        } catch (err) {
          console.error(err);
        }
      },
      mouseover: (e) => {
        if (getWardName(feature) !== highlightedWard) {
          e.target.setStyle({ weight: 2, fillOpacity: 0.7 });
        }
      },
      mouseout: (e) => {
        const currentStyle = styleFeature(feature);
        e.target.setStyle(currentStyle);
      }
    });
  };

  return (
    <div className="map-layout">
      <MapContainer center={[34.6944, 135.1948]} zoom={14} style={{ height: "600px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {geoData && (
          <GeoJSON 
            key={highlightedWard || "none"}
            data={geoData} 
            style={styleFeature} 
            onEachFeature={handleEachFeature} 
            ref={geoJsonRef}
          />
        )}

        {selectedInfo && (
          <Popup position={selectedInfo.latlng} onClose={() => setSelectedInfo(null)}>
            <div className="user-popup">
              <h3>{selectedInfo.ku}</h3>
              <p><strong>Type:</strong> {selectedInfo.property}</p>
              
              <div className="calc-box">
                <label>Adjust Quantity:</label>
                <input 
                  type="number" 
                  min="0"
                  value={userCount} 
                  onChange={(e) => setUserCount(Number(e.target.value))}
                />
                <hr />
                <div className="total-row">
                  <span>Total Price:</span>
                  <span className="price-tag">¥ {(userCount * selectedInfo.unitPrice).toLocaleString()}</span>
                </div>
                <small>Rate: ¥{selectedInfo.unitPrice} per property</small>
              </div>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}