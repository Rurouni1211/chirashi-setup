import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SettingsPage() {
  const [gasFee, setGasFee] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [avgMinutesNeeded, setAvgMinutesNeeded] = useState("");
  const [status, setStatus] = useState("Loading settings...");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`${API}/settings`);
        const data = await res.json();

        if (!res.ok) {
          setStatus(data.message || "Failed to load settings");
          return;
        }

        setGasFee(String(data.gasFee ?? 0));
        setHourlyRate(String(data.hourlyRate ?? 1000));
        setAvgMinutesNeeded(String(data.avgMinutesNeeded ?? 60));
        setStatus("");
      } catch (err) {
        console.error(err);
        setStatus("Failed to load settings");
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gasFee: Number(gasFee || 0),
          hourlyRate: Number(hourlyRate || 0),
          avgMinutesNeeded: Number(avgMinutesNeeded || 0),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.message || "Failed to save settings");
        return;
      }

      setStatus("Settings saved successfully");
    } catch (err) {
      console.error(err);
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
          }}
        >
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Gas Fee
          </label>
          <input
            type="number"
            value={gasFee}
            onChange={(e) => setGasFee(e.target.value)}
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
      </div>
    </div>
  );
}