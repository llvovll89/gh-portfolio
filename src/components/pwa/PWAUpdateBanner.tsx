import { usePWAUpdate } from "../../hooks/usePWAUpdate";

/**
 * 새 SW 버전 감지 시 화면 하단에 표시되는 업데이트 배너
 */
export const PWAUpdateBanner = () => {
    const { needRefresh, updateSW, dismissUpdate } = usePWAUpdate();

    if (!needRefresh) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3
                       px-5 py-3 rounded-xl shadow-2xl
                       bg-[#1e1e2e] border border-white/10 text-white text-sm
                       animate-[fadeIn_0.3s_ease-out]"
        >
            <span className="text-white/80">새 버전이 있습니다.</span>
            <button
                onClick={updateSW}
                className="px-3 py-1 rounded-lg bg-primary text-white font-semibold
                           hover:bg-primary/80 transition-colors text-xs"
            >
                업데이트
            </button>
            <button
                onClick={dismissUpdate}
                aria-label="닫기"
                className="text-white/50 hover:text-white/80 transition-colors text-lg leading-none"
            >
                ×
            </button>
        </div>
    );
};
