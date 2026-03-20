import { useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ZoomHandler({ highlight, geoData, geoJsonRef }) {
  const map = useMap();
  const [hasZoomed, setHasZoomed] = useState(false);

  useEffect(() => {
    if (!highlight || !geoData || !geoJsonRef.current || hasZoomed) return;

    const performInitialZoom = () => {
      const layers = geoJsonRef.current.getLayers();
      if (!layers.length) return;

      const targetLayer = layers.find((layer) => {
        const p = layer.feature?.properties || {};
        const name = p.ku || p.name || p.S_NAME || p.N03_004;
        return name === highlight;
      });

      if (targetLayer) {
        const bounds = targetLayer.getBounds();
        map.flyToBounds(bounds, {
          padding: [50, 50],
          duration: 1.5,
        });
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
  const [activeArea, setActiveArea] = useState(highlight || null);
  const geoJsonRef = useRef(null);

  useEffect(() => {
    if (highlight) setActiveArea(highlight);
  }, [highlight]);

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
                ...geo.properties,
                name: geo.properties?.name || geo.properties?.S_NAME || `Area ${idx}`,
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
            if (item?.ku) {
              map[item.ku] = item;
            }
          });
        }
        setPropertyMap(map);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [refreshKey]);

  const getWardName = (feature) => {
    const p = feature?.properties || {};
    return p.ku || p.name || p.S_NAME || p.N03_004 || "Unknown";
  };

  const styleFeature = (feature) => {
    const name = getWardName(feature);
    const isHighlighted = name === activeArea;
    const hasData = !!propertyMap[name];

    return {
      color: isHighlighted ? "#be185d" : "#475569",
      weight: isHighlighted ? 1.5 : 1,
      fillColor: isHighlighted ? "#f472b6" : hasData ? "#86efac" : "#cbd5e1",
      fillOpacity: isHighlighted ? 0.8 : 0.6,
    };
  };

  const resetLayerStyle = (layer) => {
    if (geoJsonRef.current) {
      geoJsonRef.current.resetStyle(layer);
    }
  };

  const handleEachFeature = (feature, layer) => {
    const wardName = getWardName(feature);

    layer.bindTooltip(wardName, {
      sticky: false,
      direction: "top",
      className: "ward-tooltip",
      opacity: 0.9,
      offset: [0, -8],
    });

    layer.on({
      mouseover: (e) => {
        const target = e.target;

        target.setStyle({
          weight: 1.5,
          color: "#0f172a",
          fillOpacity: 0.85,
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

      click: (e) => {
        L.DomEvent.stopPropagation(e);
        setActiveArea(wardName);

        const target = e.target;
        target.closeTooltip();

        const el = target.getElement?.();
        if (el) el.blur?.();
      },
    });
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={[34.6944, 135.1948]}
        zoom={13}
        style={{ height: "650px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <ZoomHandler
          highlight={highlight}
          geoData={geoData}
          geoJsonRef={geoJsonRef}
        />

        {geoData && (
          <GeoJSON
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