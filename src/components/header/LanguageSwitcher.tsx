import { useTranslation } from 'react-i18next'

const LANG_CYCLE: Record<string, string> = { ko: 'en', en: 'ja', ja: 'ko' }
const LANG_LABEL: Record<string, string> = { ko: 'KO', en: 'EN', ja: 'JA' }

/**
 * 헤더 언어 전환 버튼 — KO → EN → JA → KO 순환
 * i18n.changeLanguage() 호출 + localStorage 'portfolio-settings' 에 저장
 */
export const LanguageSwitcher = () => {
    const { i18n } = useTranslation()
    const current = i18n.language.slice(0, 2)

    const toggle = () => {
        const next = LANG_CYCLE[current] ?? 'en'
        i18n.changeLanguage(next)
        const existing = JSON.parse(localStorage.getItem('portfolio-settings') ?? '{}')
        localStorage.setItem('portfolio-settings', JSON.stringify({ ...existing, language: next }))
    }

    const nextLabel = LANG_LABEL[LANG_CYCLE[current] ?? 'en']

    return (
        <button
            type="button"
            onClick={toggle}
            title={`Switch to ${nextLabel}`}
            className="h-full px-2.5 sm:px-3 cursor-pointer hover:bg-sub-gary/20 text-white/60 hover:text-white transition-colors border-l border-sub-gary/10 select-none flex items-center gap-1"
        >
            <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 opacity-70"
            >
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                <path
                    d="M8 1.5C8 1.5 5.5 4 5.5 8C5.5 12 8 14.5 8 14.5M8 1.5C8 1.5 10.5 4 10.5 8C10.5 12 8 14.5 8 14.5M1.5 8H14.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                />
            </svg>
            <span className="text-[11px] sm:text-xs font-bold font-mono tracking-wide">
                {LANG_LABEL[current] ?? 'KO'}
            </span>
        </button>
    )
}
