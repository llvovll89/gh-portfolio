import { usePWAInstall } from "../../hooks/usePWAInstall";
import { useCheckedMobile } from "../../hooks/useCheckedMobile";

/**
 * 모바일에서 PWA 설치를 유도하는 배너
 * - android       : Chrome/Edge/Samsung Internet → 네이티브 설치 버튼
 * - android-manual: Firefox 등 → 브라우저 메뉴 통해 설치 안내
 * - ios-safari    : iOS Safari → 공유 → 홈 화면에 추가 가이드
 * - ios-other     : iOS Chrome/Firefox 등 → Safari에서 열도록 안내
 */
export const PWAInstallBanner = () => {
    const isMobile = useCheckedMobile();
    const { state, dismiss } = usePWAInstall();

    if (!isMobile) return null;
    if (state.status === "idle" || state.status === "installed") return null;

    return (
        <div
            role="dialog"
            aria-modal="false"
            aria-label="앱 설치 안내"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] w-[calc(100%-2rem)] max-w-sm
                       rounded-2xl shadow-2xl border border-white/10
                       bg-[#1e1e2e] text-white text-sm
                       animate-[fadeIn_0.3s_ease-out]"
        >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <img
                        src="/assets/logo/GH_logo_small_white.png"
                        alt="로고"
                        className="w-7 h-7 rounded-lg"
                    />
                    <span className="font-semibold text-white/90">GH Portfolio</span>
                </div>
                <button
                    onClick={dismiss}
                    aria-label="닫기"
                    className="text-white/40 hover:text-white/70 transition-colors text-xl leading-none px-1"
                >
                    ×
                </button>
            </div>

            <div className="px-4 pb-4">

                {/* ── Android Chrome/Edge/Samsung: 네이티브 버튼 ── */}
                {state.status === "android" && (
                    <>
                        <p className="text-white/60 text-xs mb-3">
                            홈 화면에 추가하면 앱처럼 빠르게 접속할 수 있어요.
                        </p>
                        <button
                            onClick={state.prompt}
                            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold
                                       hover:bg-primary/80 active:scale-95 transition-all text-sm"
                        >
                            홈 화면에 추가
                        </button>
                    </>
                )}

                {/* ── Android Firefox 등: 수동 안내 ── */}
                {state.status === "android-manual" && (
                    <>
                        <p className="text-white/60 text-xs mb-3">
                            브라우저 메뉴를 통해 홈 화면에 추가할 수 있어요.
                        </p>
                        <ol className="space-y-2 text-white/70 text-xs">
                            <li className="flex items-start gap-2">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">1</span>
                                <span>브라우저 우측 상단 <strong className="text-white/90">⋮ 메뉴</strong>를 탭하세요</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">2</span>
                                <span><strong className="text-white/90">홈 화면에 추가</strong> 또는 <strong className="text-white/90">앱 설치</strong>를 선택하세요</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">3</span>
                                <span><strong className="text-white/90">추가</strong>를 탭해 완료하세요</span>
                            </li>
                        </ol>
                        <button
                            onClick={dismiss}
                            className="mt-3 w-full py-2 rounded-xl border border-white/10 text-white/50
                                       hover:text-white/70 hover:border-white/20 transition-all text-xs"
                        >
                            닫기
                        </button>
                    </>
                )}

                {/* ── iOS Safari: 공유 → 홈 화면에 추가 ── */}
                {state.status === "ios-safari" && (
                    <>
                        <p className="text-white/60 text-xs mb-3">
                            홈 화면에 추가하면 앱처럼 사용할 수 있어요.
                        </p>
                        <ol className="space-y-2 text-white/70 text-xs">
                            <li className="flex items-start gap-2">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">1</span>
                                <span>
                                    하단 공유 버튼{" "}
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10 align-middle text-[11px]">⎋</span>
                                    {" "}을 탭하세요
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">2</span>
                                <span><strong className="text-white/90">홈 화면에 추가</strong>를 선택하세요</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">3</span>
                                <span>오른쪽 상단 <strong className="text-white/90">추가</strong>를 탭하세요</span>
                            </li>
                        </ol>
                        <button
                            onClick={dismiss}
                            className="mt-3 w-full py-2 rounded-xl border border-white/10 text-white/50
                                       hover:text-white/70 hover:border-white/20 transition-all text-xs"
                        >
                            닫기
                        </button>
                    </>
                )}

                {/* ── iOS Chrome/Firefox 등: Safari로 유도 ── */}
                {state.status === "ios-other" && (
                    <>
                        <p className="text-white/60 text-xs mb-3">
                            iOS에서는 <strong className="text-white/80">Safari</strong>에서만 홈 화면 추가가 가능해요.
                        </p>
                        <ol className="space-y-2 text-white/70 text-xs">
                            <li className="flex items-start gap-2">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">1</span>
                                <span>이 페이지 주소를 <strong className="text-white/90">Safari</strong>에서 열어주세요</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">2</span>
                                <span>
                                    하단 공유 버튼{" "}
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10 align-middle text-[11px]">⎋</span>
                                    {" "}→ <strong className="text-white/90">홈 화면에 추가</strong>
                                </span>
                            </li>
                        </ol>
                        <button
                            onClick={dismiss}
                            className="mt-3 w-full py-2 rounded-xl border border-white/10 text-white/50
                                       hover:text-white/70 hover:border-white/20 transition-all text-xs"
                        >
                            닫기
                        </button>
                    </>
                )}

            </div>
        </div>
    );
};
