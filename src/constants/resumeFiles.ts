// 이력서 PDF — UI 언어가 한국어면 한국어본, 그 외(en/ja)는 영문본을 기본으로 제공
export const RESUME_FILES = {
    ko: { url: "/assets/resume/김건호_이력서.pdf", fileName: "김건호_이력서.pdf" },
    en: { url: "/assets/resume/GeonhoKim_Resume_EN.pdf", fileName: "GeonhoKim_Resume_EN.pdf" },
} as const;

export type ResumeLang = keyof typeof RESUME_FILES;

export const resumeLangFor = (uiLanguage: string | undefined): ResumeLang => (uiLanguage?.startsWith("ko") ? "ko" : "en");
