import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [adminLanguage, setAdminLanguage] = useState(() => {
    return localStorage.getItem("adminLanguage") || "en";
  });

  const [userLanguage, setUserLanguage] = useState(() => {
    return localStorage.getItem("userLanguage") || "ja";
  });

  useEffect(() => {
    localStorage.setItem("adminLanguage", adminLanguage);
  }, [adminLanguage]);

  useEffect(() => {
    localStorage.setItem("userLanguage", userLanguage);
  }, [userLanguage]);

  const translate = (lang, key) => {
    return translations?.[lang]?.[key] || key;
  };

  const value = useMemo(
    () => ({
      adminLanguage,
      setAdminLanguage,
      userLanguage,
      setUserLanguage,
      tAdmin: (key) => translate(adminLanguage, key),
      tUser: (key) => translate(userLanguage, key),
    }),
    [adminLanguage, userLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(scope = "admin") {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  const {
    adminLanguage,
    setAdminLanguage,
    userLanguage,
    setUserLanguage,
    tAdmin,
    tUser,
  } = context;

  if (scope === "user") {
    return {
      language: userLanguage,
      setLanguage: setUserLanguage,
      t: tUser,
    };
  }

  return {
    language: adminLanguage,
    setLanguage: setAdminLanguage,
    t: tAdmin,
  };
}