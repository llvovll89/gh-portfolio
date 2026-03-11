import { useTranslation } from 'react-i18next'

/**
 * 헤더 우측 KO / EN 언어 전환 버튼
 * i18n.changeLanguage() 호출 + localStorage 'portfolio-settings' 에 저장
 */
export const LanguageSwitcher = () => {
    const { i18n } = useTranslation()
    const isKo = i18n.language.startsWith('ko')

    const toggle = () => {
        const next = isKo ? 'en' : 'ko'
        i18n.changeLanguage(next)
        // i18n.ts 가 읽는 동일한 키에 merge 저장
        const existing = JSON.parse(localStorage.getItem('portfolio-settings') ?? '{}')
        localStorage.setItem('portfolio-settings', JSON.stringify({ ...existing, language: next }))
    }

    return (
        <button
            type="button"
            onClick={toggle}
            title={isKo ? 'Switch to English' : '한국어로 변경'}
            className="h-full px-2.5 sm:px-3 cursor-pointer hover:bg-sub-gary/20 text-white/60 hover:text-white transition-colors border-l border-sub-gary/10 select-none flex items-center gap-1"
        >
            {/* 지구본 아이콘 */}
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
            {/* 현재 언어 표시 */}
            <span className="text-[11px] sm:text-xs font-bold font-mono tracking-wide">
                {isKo ? 'KO' : 'EN'}
            </span>
        </button>
    )
}
