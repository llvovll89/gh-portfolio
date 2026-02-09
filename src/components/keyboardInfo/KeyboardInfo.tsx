import { useContext } from "react";
import { KeyboardContext } from "../../context/KeyboardState.context";
import { keyboardKeyAndStateMock } from "./constants/mock";
import { Portal } from "../Portal";
import { useFocusTrap } from "../../hooks/useKeyboardNavigation";

export const KeyboardInfo = () => {
    const { setIsVisibleKeyboardInfo, isVisibleKeyboardInfo } =
        useContext(KeyboardContext);
    const containerRef = useFocusTrap(isVisibleKeyboardInfo);

    return (
        <Portal>
            <section
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-md"
                role="dialog"
                aria-modal="true"
                aria-label="키보드 단축키 안내"
                onClick={() => setIsVisibleKeyboardInfo(false)}
            >
                <div
                    ref={containerRef}
                    className={[
                        "relative w-full max-w-xl overflow-hidden rounded-[5px]",
                        "border border-slate-200/80 bg-white text-slate-900",
                        "shadow-[0_30px_90px_rgba(2,6,23,0.35)]",
                    ].join(" ")}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* subtle highlight */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-24 left-1/2 h-48 w-130 -translate-x-1/2 rounded-full bg-linear-to-r from-primary/18 via-fuchsia-400/14 to-sky-400/18 blur-3xl" />
                        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/35 to-transparent" />
                    </div>

                    <header className="relative flex items-center justify-between px-5 py-4 border-b border-slate-200/70">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/5 ring-1 ring-slate-200">
                                ⌘
                            </span>
                            <div className="leading-tight">
                                <p className="text-sm font-semibold tracking-tight">
                                    키보드 단축키
                                </p>
                                <p className="text-xs text-slate-500">
                                    자주 쓰는 키 조합 모음
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsVisibleKeyboardInfo(false)}
                            className={[
                                "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium",
                                "border border-slate-200 bg-white text-slate-700",
                                "transition-colors",
                                "hover:bg-slate-50",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                            ].join(" ")}
                            aria-label="닫기"
                        >
                            닫기
                        </button>
                    </header>

                    <ul className="relative max-h-[70vh] overflow-y-auto px-5 py-4">
                        {keyboardKeyAndStateMock.map((item) => (
                            <li
                                key={item.key}
                                className={[
                                    "group flex items-center justify-between gap-4",
                                    "py-2",
                                    "border-b border-slate-100 last:border-b-0",
                                ].join(" ")}
                            >
                                <span className="text-[clamp(0.7rem,1.2vw,0.9rem)] text-slate-700">
                                    {item.label}
                                </span>

                                {/* keycap */}
                                <span
                                    className={[
                                        "shrink-0 inline-flex items-center justify-center",
                                        "rounded-lg px-2 py-1",
                                        "text-[12px] font-semibold tracking-wide",
                                        "bg-slate-50 text-slate-700",
                                        "border border-slate-200",
                                        "text-[clamp(0.7rem,1.2vw,0.9rem)]",
                                        "shadow-[inset_0_-1px_0_rgba(2,6,23,0.06)]",
                                        "group-hover:border-primary/30 group-hover:bg-primary/5",
                                        "transition-colors",
                                    ].join(" ")}
                                >
                                    {item.key}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="relative px-5 py-4 border-t border-slate-200/70 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            팁: <span className="font-medium">ESC</span>를 두 번
                            누르면 열려있는 UI를 한 번에 닫을 수 있어요.
                        </p>

                        <button
                            type="button"
                            onClick={() => setIsVisibleKeyboardInfo(false)}
                            className={[
                                "text-xs font-medium text-slate-600",
                                "hover:text-slate-900 transition-colors",
                            ].join(" ")}
                        >
                            확인
                        </button>
                    </div>
                </div>
            </section>
        </Portal>
    );
};
