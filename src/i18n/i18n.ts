import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ko from "./locales/ko.json";
import en from "./locales/en.json";
import ja from "./locales/ja.json";

let defaultLanguage = "ko";
try {
    const stored = JSON.parse(localStorage.getItem("portfolio-settings") ?? "{}");
    if (["ko", "en", "ja"].includes(stored?.language)) defaultLanguage = stored.language;
} catch { /* use Korean when saved settings are unavailable */ }

const updateDocumentLanguage = (language: string) => { document.documentElement.lang = language.slice(0, 2); };
i18n.on("languageChanged", updateDocumentLanguage);

i18n.use(initReactI18next).init({
    resources: {
        ko: { translation: ko },
        en: { translation: en },
        ja: { translation: ja },
    },
    lng: defaultLanguage,
    fallbackLng: "ko",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
