import { KeyboardContext } from "@/context/KeyboardState.context";
import { useContext, useEffect, useMemo, useRef } from "react";
import { runCliCommand } from "@/utils/runCliCommand";

const urlRegex = /(https?:\/\/[^\s]+)/g;

const renderWithLinks = (line: string) => {
    const parts = line.split(urlRegex);
    return parts.map((p, i) => {
        if (p.match(urlRegex)) {
            return (
                <a key={`${p}-${i}`} href={p} target="_blank" rel="noreferrer"
                    className="text-sky-400 underline underline-offset-2 hover:text-sky-300"
                >
                    {p}
                </a>
            );
        }
        return <span key={`${p}-${i}`}>{p}</span>;
    });
};

export const ConsoleTab = () => {
    const { submitCliCommand, setSubmitCliCommand } = useContext(KeyboardContext);
    const outputRef = useRef<HTMLDivElement>(null);

    const lines = useMemo(() => {
        const v = submitCliCommand.value ?? "";
        return v ? v.split("\n") : [];
    }, [submitCliCommand.value]);

    const hasOutput = lines.length > 0;

    // 새 출력이 생길 때마다 스크롤 맨 아래로
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [submitCliCommand.value]);

    const copy = async () => {
        try { await navigator.clipboard.writeText(submitCliCommand.value ?? ""); } catch { }
    };

    const download = () => {
        const blob = new Blob([submitCliCommand.value ?? ""], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cli-output-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const clear = () => {
        setSubmitCliCommand({ value: "", isVisibleCommandUi: false });
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key !== "Enter" || event.shiftKey) return;
        event.preventDefault();
        event.stopPropagation();

        const raw = event.currentTarget.value.trim();
        if (!raw) { event.currentTarget.value = ""; return; }

        if (raw.toLowerCase() === "clear") {
            setSubmitCliCommand({ value: "", isVisibleCommandUi: false });
            event.currentTarget.value = "";
            return;
        }

        const output = runCliCommand(raw);
        const now = new Date().toLocaleTimeString("ko-KR");
        const composed = [`[${now}] $ ${raw}`, output || "(no output)"].join("\n");

        setSubmitCliCommand((prev) => {
            const newValue = prev.value ? `${prev.value}\n\n${composed}` : composed;
            return { value: newValue, isVisibleCommandUi: false };
        });
        event.currentTarget.value = "";
    };

    return (
        <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-mono text-[11px]">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 text-[10px] text-white/50">
                    <span className="h-2 w-2 rounded-full bg-red-400/80" />
                    <span className="h-2 w-2 rounded-full bg-yellow-300/80" />
                    <span className="h-2 w-2 rounded-full bg-green-400/80" />
                    <span className="ml-1">Output</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={copy} disabled={!hasOutput} type="button"
                        className="rounded px-2 py-0.5 text-[10px] font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >복사</button>
                    <button onClick={download} disabled={!hasOutput} type="button"
                        className="rounded px-2 py-0.5 text-[10px] font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >다운로드</button>
                    <button onClick={clear} disabled={!hasOutput} type="button"
                        className="rounded px-2 py-0.5 text-[10px] font-medium border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >초기화</button>
                </div>
            </div>

            {/* 출력 영역 */}
            <div ref={outputRef} className="flex-1 overflow-auto p-3 scrolls">
                {!hasOutput ? (
                    <div className="flex flex-col items-center justify-center h-full gap-1.5 text-white/25 select-none">
                        <span className="text-xs">아직 출력이 없습니다</span>
                        <span className="text-[10px]">아래 입력창에서 명령어를 실행하세요</span>
                    </div>
                ) : (
                    <pre className="m-0 text-[10px] leading-relaxed whitespace-pre-wrap text-white/85">
                        {lines.map((line, idx) => (
                            <div key={idx}>{renderWithLinks(line)}</div>
                        ))}
                    </pre>
                )}
            </div>

            {/* 입력 영역 — 콘솔 탭에서도 명령어 실행 가능 */}
            <div className="shrink-0 border-t border-white/10 px-3 py-1.5 flex items-center gap-1.5 bg-zinc-950">
                <span className="text-green-400 select-none shrink-0">llvovll89@DESKTOP</span>
                <span className="text-yellow-300 select-none shrink-0">/d/gh-portfolio</span>
                <span className="text-blue-300 select-none shrink-0">(main)</span>
                <span className="text-zinc-400 select-none shrink-0">$</span>
                <textarea
                    rows={1}
                    autoFocus
                    placeholder="help"
                    className="flex-1 resize-none outline-none bg-transparent text-zinc-100 placeholder:text-zinc-600 leading-relaxed"
                    onKeyDown={handleKeyDown}
                />
            </div>
        </div>
    );
};
