import { SETTINGS_STORAGE_KEY } from "../constants/settings";
import i18n, { type BackendModule, type ResourceLanguage } from "i18next";
import { initReactI18next } from "react-i18next";
import ko from "./locales/ko.json";

const SUPPORTED_LANGUAGES = ["ko", "en", "ja"];

let defaultLanguage = "ko";
try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "{}") as { language?: string } | null;
    const language = stored?.language;
    if (language && SUPPORTED_LANGUAGES.includes(language)) defaultLanguage = language;
} catch { /* use Korean when saved settings are unavailable */ }

// ko(기본·fallback)만 번들에 포함하고 en/ja는 필요할 때 별도 청크로 로드
const lazyLocales: Record<string, () => Promise<{ default: ResourceLanguage }>> = {
    en: () => import("./locales/en.json"),
    ja: () => import("./locales/ja.json"),
};
const localeBackend: BackendModule = {
    type: "backend",
    init() {},
    read(language, _namespace, callback) {
        const load = lazyLocales[language];
        if (!load) return callback(null, language === "ko" ? ko : {});
        load().then(module => callback(null, module.default), (error: Error) => callback(error, null));
    },
};

const updateDocumentLanguage = (language: string) => { document.documentElement.lang = language.slice(0, 2); };
i18n.on("languageChanged", updateDocumentLanguage);

/** 저장된 언어 리소스까지 로드되면 resolve — main.tsx는 이후에 렌더해 잘못된 언어 노출을 막음 */
export const i18nReady = i18n.use(localeBackend).use(initReactI18next).init({
    resources: { ko: { translation: ko } },
    partialBundledLanguages: true,
    supportedLngs: SUPPORTED_LANGUAGES,
    lng: defaultLanguage,
    fallbackLng: "ko",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
