import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function UserTopBar() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        marginBottom: "16px",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "12px 16px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <label style={{ fontWeight: "bold", color: "#334155" }}>
          {t("language")}
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: "8px 10px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "white",
          }}
        >
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="my">မြန်မာ</option>
        </select>
      </div>

    </div>
  );
}