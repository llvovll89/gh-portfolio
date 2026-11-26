import { uiText } from "../../utils/uiText";
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
            // left-1/2 배치는 너비를 지정하지 않으면 화면 절반 폭으로 줄어 글자가 깨지므로 폭을 명시
            // 모바일은 하단 내비(bottom-4, h-14) 위, 데스크톱은 상태바 위
            className={`fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-10 left-1/2 -translate-x-1/2
                       w-[calc(100%-2rem)] max-w-md flex items-center gap-3
                       px-4 py-3 rounded-xl shadow-2xl
                       bg-panel border border-line text-foreground text-sm
                       ${closing ? "animate-[fadeOut_0.25s_ease-in_forwards]" : "animate-[fadeIn_0.3s_ease-out]"}`}
        >
            <span className="min-w-0 flex-1 text-foreground">{uiText("새 버전이 있습니다.")}</span>
            <button
                onClick={() => { void updateSW(); }}
                className="shrink-0 whitespace-nowrap min-h-11 px-4 rounded-lg bg-primary text-slate-950 font-semibold
                           hover:bg-primary/80 transition-colors text-xs"
            >
                {uiText("업데이트")}</button>
            <button
                onClick={handleDismiss}
                aria-label={uiText("닫기")}
                className="shrink-0 grid place-items-center min-h-11 min-w-11 text-muted hover:text-foreground transition-colors text-lg leading-none"
            >
                ×
            </button>
        </div>
    );
};
