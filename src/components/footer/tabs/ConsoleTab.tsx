import { KeyboardContext } from "@/context/KeyboardState.context";
import { useContext, useMemo } from "react";

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
    const { submitCliCommand } = useContext(KeyboardContext);

    const lines = useMemo(() => {
        const v = submitCliCommand.value ?? "";
        return v.split("\n");
    }, [submitCliCommand.value]);

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
        <div className="h-full flex flex-col bg-slate-950 text-slate-100">
            {/* Header with buttons */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-[10px] text-white/60">
                    <span className="h-2 w-2 rounded-full bg-red-400/80" />
                    <span className="h-2 w-2 rounded-full bg-yellow-300/80" />
                    <span className="h-2 w-2 rounded-full bg-green-400/80" />
                    <span className="ml-1">Output</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={copy}
                        className="rounded-md px-2 py-1 text-[10px] font-medium border border-white/20 bg-white/5 hover:bg-white/10 text-white/80"
                        type="button"
                    >
                        복사
                    </button>
                    <button
                        onClick={download}
                        className="rounded-md px-2 py-1 text-[10px] font-medium border border-white/20 bg-white/5 hover:bg-white/10 text-white/80"
                        type="button"
                    >
                        다운로드
                    </button>
                </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-auto p-3">
                {lines.length === 0 || !submitCliCommand.value ? (
                    <div className="flex items-center justify-center h-full text-white/40 text-xs">
                        콘솔 출력이 여기에 표시됩니다
                    </div>
                ) : (
                    <pre className="m-0 text-[10px] leading-relaxed font-mono whitespace-pre-wrap text-white/90">
                        {lines.map((line, idx) => (
                            <div key={idx} className="wrap-break-word">
                                {renderWithLinks(line)}
                            </div>
                        ))}
                    </pre>
                )}
            </div>
        </div>
    );
};
