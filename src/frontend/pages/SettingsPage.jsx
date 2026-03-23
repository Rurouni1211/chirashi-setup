import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../context/LanguageContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SettingsPage() {
  const { t } = useLanguage();

  const [fuelPricePerLitre, setFuelPricePerLitre] = useState("");
  const [fuelUsedPerDelivery, setFuelUsedPerDelivery] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [avgMinutesNeeded, setAvgMinutesNeeded] = useState("");
  const [marginPercent, setMarginPercent] = useState("");
  const [savedSettings, setSavedSettings] = useState(null);
  const [status, setStatus] = useState(t("loadingSettings"));
  const [sampleUnits, setSampleUnits] = useState("50");

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

  const formulaData = useMemo(() => {
    const fuel = Number(savedSettings?.fuelPricePerLitre || 0);
    const litres = Number(savedSettings?.fuelUsedPerDelivery || 0);
    const hourly = Number(savedSettings?.hourlyRate || 0);
    const minutes = Number(savedSettings?.avgMinutesNeeded || 0);
    const margin = Number(savedSettings?.marginPercent || 0);
    const units = Math.max(Number(sampleUnits || 0), 1);

    const fuelCost = fuel * litres;
    const laborHours = minutes / 60;
    const laborCost = laborHours * hourly;
    const baseCostPerDelivery = fuelCost + laborCost;
    const finalPricePerUnit = Math.ceil(
      (baseCostPerDelivery / units) * (1 + margin / 100)
    );

    return {
      fuelCost,
      laborHours,
      laborCost,
      baseCostPerDelivery,
      finalPricePerUnit,
      units,
    };
  }, [savedSettings, sampleUnits]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "24px" }}>
        <h1 style={{ marginTop: 0 }}>{t("businessSettings")}</h1>

        <div
          style={{
            maxWidth: "620px",
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            marginBottom: "20px",
          }}
        >
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            {t("fuelPricePerLitre")}
          </label>
          <input
            type="number"
            value={fuelPricePerLitre}
            onChange={(e) => setFuelPricePerLitre(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "16px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
          />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            {t("fuelUsedPerDelivery")}
          </label>
          <input
            type="number"
            step="0.01"
            value={fuelUsedPerDelivery}
            onChange={(e) => setFuelUsedPerDelivery(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "16px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
          />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            {t("hourlyRate")}
          </label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "16px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
          />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            {t("averageMinutesNeeded")}
          </label>
          <input
            type="number"
            value={avgMinutesNeeded}
            onChange={(e) => setAvgMinutesNeeded(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "16px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
          />

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            {t("marginPercent")}
          </label>
          <input
            type="number"
            value={marginPercent}
            onChange={(e) => setMarginPercent(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "20px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
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
            {t("saveSettings")}
          </button>

          {status && (
            <p style={{ marginTop: "14px", color: "#334155" }}>{status}</p>
          )}
        </div>

        <div
          style={{
            maxWidth: "620px",
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "1.2rem" }}>{t("currentSavedSettings")}</h2>

          {!savedSettings ? (
            <p style={{ color: "#64748b" }}>{t("noSavedSettings")}</p>
          ) : (
            <>
              <p><b>{t("fuelPricePerLitre")}:</b> ¥{Number(savedSettings.fuelPricePerLitre || 0).toLocaleString()}</p>
              <p><b>{t("fuelUsedPerDelivery")}:</b> {Number(savedSettings.fuelUsedPerDelivery || 0).toLocaleString()} L</p>
              <p><b>{t("hourlyRate")}:</b> ¥{Number(savedSettings.hourlyRate || 0).toLocaleString()}</p>
              <p><b>{t("averageMinutesNeeded")}:</b> {Number(savedSettings.avgMinutesNeeded || 0).toLocaleString()} minutes</p>
              <p><b>{t("marginPercent")}:</b> {Number(savedSettings.marginPercent || 0).toLocaleString()}%</p>

              <hr style={{ margin: "18px 0" }} />

              <h3 style={{ marginTop: 0 }}>{t("formulaPreview")}</h3>
              <p style={{ lineHeight: 1.7 }}>
                ((¥{Number(savedSettings.fuelPricePerLitre || 0).toLocaleString()} × {Number(savedSettings.fuelUsedPerDelivery || 0).toLocaleString()}L)
                {" + "}
                (({Number(savedSettings.avgMinutesNeeded || 0).toLocaleString()} / 60) × ¥{Number(savedSettings.hourlyRate || 0).toLocaleString()}))
                {" ÷ "}
                {formulaData.units.toLocaleString()}
                {" × "}
                (1 + {Number(savedSettings.marginPercent || 0).toLocaleString()} / 100)
              </p>

              <div style={{ marginTop: "14px", marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                  {t("sampleUnits")}
                </label>
                <input
                  type="number"
                  value={sampleUnits}
                  onChange={(e) => setSampleUnits(e.target.value)}
                  style={{
                    width: "220px",
                    padding: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <p><b>Fuel Cost:</b> ¥{formulaData.fuelCost.toLocaleString()}</p>
              <p><b>Labor Hours:</b> {formulaData.laborHours.toFixed(2)}</p>
              <p><b>Labor Cost:</b> ¥{formulaData.laborCost.toLocaleString()}</p>
              <p><b>Base Cost Per Delivery:</b> ¥{formulaData.baseCostPerDelivery.toLocaleString()}</p>
              <p style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#be185d" }}>
                {t("formulaExample")}: ¥{formulaData.finalPricePerUnit.toLocaleString()}
              </p>

              <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "16px" }}>
                {t("noteDataNotTranslated")}
              </p>

              {savedSettings.updatedAt && (
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  {t("lastUpdated")}: {new Date(savedSettings.updatedAt).toLocaleString()}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}