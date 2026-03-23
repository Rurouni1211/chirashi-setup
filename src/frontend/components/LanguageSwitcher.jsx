import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ marginTop: "20px" }}>
      <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
        Language
      </label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #64748b",
        }}
      >
        <option value="en">English</option>
        <option value="ja">日本語</option>
        <option value="my">မြန်မာ</option>
      </select>
    </div>
  );
}