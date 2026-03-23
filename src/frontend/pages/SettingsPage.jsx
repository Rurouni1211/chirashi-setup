import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SettingsPage() {
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState("");
  const [fuelUsedPerDelivery, setFuelUsedPerDelivery] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [avgMinutesNeeded, setAvgMinutesNeeded] = useState("");
  const [marginPercent, setMarginPercent] = useState("");
  const [savedSettings, setSavedSettings] = useState(null);
  const [status, setStatus] = useState("Loading settings...");

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API}/settings`);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("GET /settings returned non-JSON:", text);
        setStatus("Settings API returned invalid response");
        return;
      }

      if (!res.ok) {
        setStatus(data.message || "Failed to load settings");
        return;
      }

      setFuelPricePerLitre(String(data.fuelPricePerLitre ?? 0));
      setFuelUsedPerDelivery(String(data.fuelUsedPerDelivery ?? 0));
      setHourlyRate(String(data.hourlyRate ?? 1000));
      setAvgMinutesNeeded(String(data.avgMinutesNeeded ?? 60));
      setMarginPercent(String(data.marginPercent ?? 20));
      setSavedSettings(data);
      setStatus("");
    } catch (err) {
      console.error("Load settings error:", err);
      setStatus("Failed to load settings");
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        fuelPricePerLitre: Number(fuelPricePerLitre || 0),
        fuelUsedPerDelivery: Number(fuelUsedPerDelivery || 0),
        hourlyRate: Number(hourlyRate || 0),
        avgMinutesNeeded: Number(avgMinutesNeeded || 0),
        marginPercent: Number(marginPercent || 0),
      };

      const res = await fetch(`${API}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("POST /settings returned non-JSON:", text);
        setStatus("Settings save returned invalid response");
        return;
      }

      if (!res.ok) {
        setStatus(data.message || "Failed to save settings");
        return;
      }

      setSavedSettings(data);
      setFuelPricePerLitre(String(data.fuelPricePerLitre ?? 0));
      setFuelUsedPerDelivery(String(data.fuelUsedPerDelivery ?? 0));
      setHourlyRate(String(data.hourlyRate ?? 1000));
      setAvgMinutesNeeded(String(data.avgMinutesNeeded ?? 60));
      setMarginPercent(String(data.marginPercent ?? 20));
      setStatus("Settings saved successfully");
    } catch (err) {
      console.error("Save settings error:", err);
      setStatus("Failed to save settings");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "24px" }}>
        <h1 style={{ marginTop: 0 }}>Business Settings</h1>

        <div
          style={{
            maxWidth: "520px",
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Fuel Price Per Litre
          </label>
          <input
            type="number"
            value={fuelPricePerLitre}
            onChange={(e) => setFuelPricePerLitre(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "16px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
            }}
          />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Fuel Used Per Delivery (Litres)
          </label>
          <input
            type="number"
            step="0.01"
            value={fuelUsedPerDelivery}
            onChange={(e) => setFuelUsedPerDelivery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "16px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
            }}
          />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Hourly Rate
          </label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "16px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
            }}
          />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Average Minutes Needed
          </label>
          <input
            type="number"
            value={avgMinutesNeeded}
            onChange={(e) => setAvgMinutesNeeded(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "16px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
            }}
          />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Margin Percent
          </label>
          <input
            type="number"
            value={marginPercent}
            onChange={(e) => setMarginPercent(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "20px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
            }}
          />

          <button
            onClick={handleSave}
            style={{
              background: "#be185d",
              color: "white",
              padding: "12px 18px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Save Settings
          </button>

          {status && (
            <p style={{ marginTop: "14px", color: "#334155" }}>
              {status}
            </p>
          )}
        </div>

        <div
          style={{
            maxWidth: "520px",
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "1.2rem" }}>Current Saved Settings</h2>

          {!savedSettings ? (
            <p style={{ color: "#64748b" }}>No saved settings yet.</p>
          ) : (
            <>
              <p>
                <b>Fuel Price Per Litre:</b> ¥
                {Number(savedSettings.fuelPricePerLitre || 0).toLocaleString()}
              </p>
              <p>
                <b>Fuel Used Per Delivery:</b>{" "}
                {Number(savedSettings.fuelUsedPerDelivery || 0).toLocaleString()} L
              </p>
              <p>
                <b>Hourly Rate:</b> ¥
                {Number(savedSettings.hourlyRate || 0).toLocaleString()}
              </p>
              <p>
                <b>Average Minutes Needed:</b>{" "}
                {Number(savedSettings.avgMinutesNeeded || 0).toLocaleString()} minutes
              </p>
              <p>
                <b>Margin Percent:</b>{" "}
                {Number(savedSettings.marginPercent || 0).toLocaleString()}%
              </p>
              {savedSettings.updatedAt && (
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  Last updated: {new Date(savedSettings.updatedAt).toLocaleString()}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}