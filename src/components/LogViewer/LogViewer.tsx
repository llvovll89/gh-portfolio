import {useContext, useMemo} from "react";
import {KeyboardContext} from "../../context/KeyboardState.context";
import {Portal} from "../Portal";

const urlRegex = /(https?:\/\/[^\s]+)/g;

const renderWithLinks = (line: string) => {
    const parts = line.split(urlRegex);
    return parts.map((p, i) => {
        if (p.match(urlRegex)) {
            return (
                <a
                    key={`${p}-${i}`}
                    href={p}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-300 underline underline-offset-2 hover:text-sky-200"
                >
                    {p}
                </a>
            );
        }
        return <span key={`${p}-${i}`}>{p}</span>;
    });
};

export const LogViewer = () => {
    const {submitCliCommand, setSubmitCliCommand} = useContext(KeyboardContext);

    const lines = useMemo(() => {
        const v = submitCliCommand.value ?? "";
        return v.split("\n");
    }, [submitCliCommand.value]);

    const close = () =>
        setSubmitCliCommand({
            value: "",
            isVisibleCommandUi: false,
        });

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(submitCliCommand.value ?? "");
        } catch {
            // ignore
        }
    };

    const download = () => {
        const blob = new Blob([submitCliCommand.value ?? ""], {
            type: "text/plain;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cli-output-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Portal>
            <section
                className="select-none fixed inset-0 z-999 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-md"
                onClick={close}
                role="dialog"
                aria-modal="true"
                aria-label="CLI Command Output"
            >
                <div
                    className={[
                        "relative w-full max-w-3xl overflow-hidden rounded-2xl",
                        "border border-slate-200/80 bg-white text-slate-900",
                        "shadow-[0_30px_90px_rgba(2,6,23,0.35)]",
                    ].join(" ")}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* highlight */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-24 left-1/2 h-48 w-155 -translate-x-1/2 rounded-full bg-linear-to-r from-primary/18 via-fuchsia-400/14 to-sky-400/18 blur-3xl" />
                        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/35 to-transparent" />
                    </div>

                    <header className="relative flex items-center justify-between px-5 py-4 border-b border-slate-200/70">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold tracking-tight">
                                CLI Command Output
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                텍스트 / 링크 자동 인식 / 복사 / 다운로드
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={copy}
                                className="rounded-lg px-3 py-2 text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50"
                                type="button"
                            >
                                복사
                            </button>
                            <button
                                onClick={download}
                                className="rounded-lg px-3 py-2 text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50"
                                type="button"
                            >
                                다운로드
                            </button>
                            <button
                                onClick={close}
                                className="rounded-lg px-3 py-2 text-xs font-medium bg-primary text-white hover:bg-primary/90"
                                type="button"
                            >
                                닫기
                            </button>
                        </div>
                    </header>

                    <div className="relative max-h-[70vh] overflow-auto p-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-950 text-slate-100 overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 text-[11px] text-white/70">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                                <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/80" />
                                <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                                <span className="ml-2">Output</span>
                            </div>

                            <pre className="m-0 p-4 text-xs leading-relaxed font-mono whitespace-pre-wrap">
                                {lines.map((line, idx) => (
                                    <div key={idx} className="wrap-break-word">
                                        {renderWithLinks(line)}
                                    </div>
                                ))}
                            </pre>
                        </div>
                    </div>
                </div>
            </section>
        </Portal>
    );
};
