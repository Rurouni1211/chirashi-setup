import { useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API　= import.meta.env.VITE_API_URL;

//const API_BASE = "http://localhost:5000";

function ZoomHandler({ highlight, geoData, geoJsonRef }) {
  const map = useMap();
  // track if we have already performed the initial focus zoom
  const [hasZoomed, setHasZoomed] = useState(false);

  useEffect(() => {
    // Only proceed if we have a highlight, data, and haven't zoomed yet
    if (!highlight || !geoData || !geoJsonRef.current || hasZoomed) return;

    const performInitialZoom = () => {
      const layers = geoJsonRef.current.getLayers();
      if (layers.length === 0) return;

      const targetLayer = layers.find(layer => {
        const p = layer.feature.properties;
        const name = p.ku || p.name || p.S_NAME || p.N03_004;
        return name === highlight;
      });

      if (targetLayer) {
        const bounds = targetLayer.getBounds();
        map.flyToBounds(bounds, { 
          padding: [50, 50], 
          duration: 1.5 
        });
        // Mark as zoomed so it doesn't trigger again on subsequent clicks
        setHasZoomed(true);
      }
    };

    const timer = setTimeout(performInitialZoom, 300);
    return () => clearTimeout(timer);
  }, [highlight, geoData, map, geoJsonRef, hasZoomed]);

  return null;
}

export default function MapView({ refreshKey, highlight }) {
  const [geoData, setGeoData] = useState(null);
  const [propertyMap, setPropertyMap] = useState({});
  // This internal state handles the "glow/color" highlight separately from the camera zoom
  const [activeArea, setActiveArea] = useState(highlight || null);
  const geoJsonRef = useRef(null);

  // Sync active area color when props change, but ZoomHandler handles the camera
  useEffect(() => {
    if (highlight) setActiveArea(highlight);
  }, [highlight]);

  // Load GeoJSON
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
      });
  }, []);

  // Load Admin Data
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/properties`);
        const data = await res.json();
        const map = {};
        data.forEach(item => { map[item.ku] = item; });
        setPropertyMap(map);
      } catch (err) { console.error(err); }
    };
    load();
  }, [refreshKey]);

  const getWardName = (feature) => {
    const p = feature.properties;
    return p.ku || p.name || p.S_NAME || p.N03_004 || "Unknown";
  };

  const styleFeature = (feature) => {
    const name = getWardName(feature);
    const isHighlighted = name === activeArea;
    const hasData = propertyMap[name];

    return {
      color: isHighlighted ? "#be185d" : "#475569",
      weight: isHighlighted ? 3 : 1,
      fillColor: isHighlighted ? "#f472b6" : (hasData ? "#86efac" : "#cbd5e1"),
      fillOpacity: isHighlighted ? 0.8 : 0.6,
    };
  };

  const handleEachFeature = (feature, layer) => {
  const wardName = getWardName(feature);

  layer.bindTooltip(wardName, {
    sticky: true,
    direction: "auto",
    className: "ward-tooltip",
    opacity: 0.9,
    offset: [10, -10],
  });

  layer.on({
    click: (e) => {
      L.DomEvent.stopPropagation(e);
      setActiveArea(wardName);

      // remove browser/Leaflet focus border after click
      const el = layer.getElement?.();
      if (el) el.blur?.();
    },
  });
};

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer center={[34.6944, 135.1948]} zoom={13} style={{ height: "650px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* ZoomHandler only runs once due to the hasZoomed state check */}
        <ZoomHandler 
          highlight={highlight} 
          geoData={geoData} 
          geoJsonRef={geoJsonRef} 
        />

        {geoData && (
          <GeoJSON 
            key={`geojson-${activeArea}-${refreshKey}`}
            data={geoData} 
            style={styleFeature} 
            onEachFeature={handleEachFeature} 
            ref={geoJsonRef}
          />
        )}
      </MapContainer>
    </div>
  );
}