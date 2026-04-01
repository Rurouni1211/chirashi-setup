import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher({ scope = "admin" }) {
  const { language, setLanguage, t } = useLanguage(scope);

  return (
    <div style={{ marginTop: "20px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "bold",
        }}
      >
        {t("language")}
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
        <option value="en">{t("english")}</option>
        <option value="ja">{t("japanese")}</option>
        <option value="my">{t("myanmar")}</option>
      </select>
    </div>
  );
}