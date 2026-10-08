import { useState } from "react";
import { usePWAUpdate } from "../../hooks/usePWAUpdate";
import { SURFACE_LAYERS } from "../../constants/layout";

/**
 * 새 SW 버전 감지 시 화면 하단에 표시되는 업데이트 배너
 */
export const PWAUpdateBanner = () => {
    const { needRefresh, updateSW, dismissUpdate } = usePWAUpdate();
    const [closing, setClosing] = useState(false);

    if (!needRefresh) return null;

    const handleDismiss = () => {
        setClosing(true);
        setTimeout(dismissUpdate, 250);
    };

    return (
        <div
            role="status"
            aria-live="polite"
            style={{ zIndex: SURFACE_LAYERS.notice }}
            className={`fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3
                       px-5 py-3 rounded-xl shadow-2xl
                       bg-[#1e1e2e] border border-foreground/10 text-foreground text-sm
                       ${closing ? "animate-[fadeOut_0.25s_ease-in_forwards]" : "animate-[fadeIn_0.3s_ease-out]"}`}
        >
            <span className="text-foreground">새 버전이 있습니다.</span>
            <button
                onClick={updateSW}
                className="px-3 py-1 rounded-lg bg-primary text-slate-950 font-semibold
                           hover:bg-primary/80 transition-colors text-xs"
            >
                업데이트
            </button>
            <button
                onClick={handleDismiss}
                aria-label="닫기"
                className="text-muted hover:text-foreground transition-colors text-lg leading-none"
            >
                ×
            </button>
        </div>
    );
};
