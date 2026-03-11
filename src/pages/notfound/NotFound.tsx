import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useThemeStyle } from "../../hooks/useThemeStyle";

// 터미널 타이핑 애니메이션용 훅
function useTypewriter(lines: string[], speed = 30) {
    const [displayed, setDisplayed] = useState<string[]>([]);
    const [lineIdx, setLineIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);

    useEffect(() => {
        if (lineIdx >= lines.length) return;
        if (charIdx < lines[lineIdx].length) {
            const t = setTimeout(() => setCharIdx((c) => c + 1), speed);
            return () => clearTimeout(t);
        } else {
            const t = setTimeout(() => {
                setDisplayed((d) => [...d, lines[lineIdx]]);
                setLineIdx((l) => l + 1);
                setCharIdx(0);
            }, 120);
            return () => clearTimeout(t);
        }
    }, [lineIdx, charIdx, lines, speed]);

    const currentLine =
        lineIdx < lines.length ? lines[lineIdx].slice(0, charIdx) : null;

    return { displayed, currentLine };
}

export const NotFound = () => {
    const { backgroundStyle, backgroundClass } = useThemeStyle();
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname;

    const terminalLines = [
        `$ vite build --mode production`,
        `✓ 495 modules transformed.`,
        ``,
        `ERROR  Failed to resolve import "${path}"`,
        `       Module not found: Cannot resolve '${path}'`,
        `       Is the path correct? → src/pages${path}.tsx`,
        ``,
        `Build failed with 1 error`,
        `error during build:`,
        `  RollupError: [plugin vite:import-analysis] 404 Not Found`,
    ];

    const { displayed, currentLine } = useTypewriter(terminalLines, 22);

    const codeLines = [
        { num: 1,  tokens: [{ t: "comment", v: `// 📂 src/pages${path}.tsx` }] },
        { num: 2,  tokens: [] },
        { num: 3,  tokens: [{ t: "keyword", v: "import" }, { t: "plain", v: " { Route } " }, { t: "keyword", v: "from" }, { t: "string", v: ' "react-router-dom"' }] },
        { num: 4,  tokens: [{ t: "keyword", v: "import" }, { t: "plain", v: " { " }, { t: "error-token", v: "PageComponent" }, { t: "plain", v: ' } ' }, { t: "keyword", v: "from" }, { t: "string", v: ` ".${path}"` }, { t: "error-squiggle", v: " // ← ❌" }] },
        { num: 5,  tokens: [] },
        { num: 6,  tokens: [{ t: "keyword", v: "export default function" }, { t: "fn", v: " NotFound" }, { t: "plain", v: "() {" }] },
        { num: 7,  tokens: [{ t: "plain", v: "  " }, { t: "keyword", v: "return" }, { t: "plain", v: " (" }] },
        { num: 8,  tokens: [{ t: "plain", v: "    <" }, { t: "tag", v: "Error" }, { t: "attr", v: " code" }, { t: "plain", v: "=" }, { t: "string", v: "{404}" }, { t: "plain", v: " />" }] },
        { num: 9,  tokens: [{ t: "plain", v: "  )" }] },
        { num: 10, tokens: [{ t: "plain", v: "}" }] },
    ];

    const tokenColor: Record<string, string> = {
        keyword:       "text-[#569cd6]",
        string:        "text-[#ce9178]",
        comment:       "text-[#6a9955]",
        fn:            "text-[#dcdcaa]",
        tag:           "text-[#4ec9b0]",
        attr:          "text-[#9cdcfe]",
        plain:         "text-[#d4d4d4]",
        "error-token": "text-red-400 underline decoration-wavy decoration-red-500",
        "error-squiggle": "text-red-400/70 italic text-xs",
    };

    return (
        <section
            className={`w-screen h-screen flex flex-col ${backgroundClass} overflow-hidden select-none`}
            style={backgroundStyle}
        >
            {/* ── 탭 바 ─────────────────────────────────── */}
            <div className="flex items-end h-9 border-b border-sub-gary/20 bg-base-navy/60 shrink-0 px-0">
                {/* 활성 탭 */}
                <div className="flex items-center gap-2 h-full px-4 bg-[#1e1e1e] border-t border-t-red-500 border-r border-sub-gary/20 text-[#d4d4d4] text-xs font-mono">
                    <span className="text-red-400">●</span>
                    <span>404.tsx</span>
                    <span className="text-white/30 hover:text-white/60 cursor-pointer ml-1">✕</span>
                </div>
                <div className="flex items-center gap-2 h-full px-4 border-r border-sub-gary/20 text-white/30 text-xs font-mono hover:text-white/50 cursor-pointer bg-transparent">
                    <span>index.tsx</span>
                </div>
            </div>

            {/* ── 브레드크럼 ────────────────────────────── */}
            <div className="flex items-center gap-1 px-4 py-1.5 text-[11px] text-white/40 font-mono border-b border-sub-gary/10 bg-[#1e1e1e] shrink-0">
                <span>src</span>
                <span className="text-white/20">›</span>
                <span>pages</span>
                <span className="text-white/20">›</span>
                <span className="text-red-400">{path.replace(/^\//, "") || "unknown"}.tsx</span>
                <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px]">
                    Cannot resolve module
                </span>
            </div>

            {/* ── 에디터 + 터미널 ───────────────────────── */}
            <div className="flex flex-col flex-1 overflow-hidden">

                {/* 코드 에디터 */}
                <div className="flex flex-1 overflow-hidden bg-[#1e1e1e]">
                    {/* 라인 넘버 */}
                    <div className="flex flex-col items-end pr-4 pl-3 py-4 text-white/20 font-mono text-xs select-none border-r border-sub-gary/10 shrink-0">
                        {codeLines.map((l) => (
                            <div key={l.num} className={`leading-6 ${l.num === 4 ? "text-red-500/50" : ""}`}>
                                {l.num}
                            </div>
                        ))}
                    </div>

                    {/* 코드 본문 */}
                    <div className="flex flex-col py-4 pl-4 font-mono text-xs overflow-x-auto flex-1">
                        {codeLines.map((l) => (
                            <div
                                key={l.num}
                                className={`leading-6 whitespace-pre ${l.num === 4 ? "bg-red-500/10 rounded-sm" : ""}`}
                            >
                                {l.tokens.length === 0 ? (
                                    <span>&nbsp;</span>
                                ) : (
                                    l.tokens.map((tok, i) => (
                                        <span key={i} className={tokenColor[tok.t] ?? "text-[#d4d4d4]"}>
                                            {tok.v}
                                        </span>
                                    ))
                                )}
                            </div>
                        ))}

                        {/* 404 큰 표시 */}
                        <div className="mt-8 ml-4 flex items-baseline gap-4">
                            <span className="text-[80px] sm:text-[120px] font-black leading-none text-white/5 select-none font-mono">
                                404
                            </span>
                            <div className="flex flex-col gap-3">
                                <p className="text-white/60 text-sm font-sans">페이지를 찾을 수 없어요.</p>
                                <p className="text-white/30 text-xs font-sans max-w-xs">
                                    요청하신 경로 <code className="text-primary/80 bg-primary/10 px-1 rounded">{path}</code>가 존재하지 않거나 이동되었습니다.
                                </p>
                                <div className="flex gap-2 mt-1">
                                    <Link
                                        to="/"
                                        className="px-4 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded text-xs font-sans transition-colors"
                                    >
                                        홈으로
                                    </Link>
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-sub-gary/20 rounded text-xs font-sans transition-colors"
                                    >
                                        이전 페이지
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 터미널 패널 ──────────────────────────── */}
                <div className="h-44 sm:h-52 border-t border-sub-gary/20 bg-[#0c0c0c] flex flex-col shrink-0">
                    {/* 패널 탭 */}
                    <div className="flex items-center gap-0 border-b border-sub-gary/15 shrink-0">
                        {["PROBLEMS", "OUTPUT", "TERMINAL", "DEBUG CONSOLE"].map((tab, i) => (
                            <button
                                key={tab}
                                className={`px-3 py-1.5 text-[10px] font-mono border-r border-sub-gary/10 transition-colors ${
                                    i === 2
                                        ? "text-white/80 bg-white/5 border-t border-t-primary/60"
                                        : "text-white/30 hover:text-white/50"
                                }`}
                            >
                                {i === 0 && (
                                    <span className="inline-flex items-center gap-1">
                                        <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block text-[8px] leading-3 text-center font-bold">1</span>
                                        {tab}
                                    </span>
                                )}
                                {i !== 0 && tab}
                            </button>
                        ))}
                    </div>

                    {/* 터미널 출력 */}
                    <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] scrolls">
                        {displayed.map((line, i) => (
                            <div key={i} className={`leading-5 ${
                                line.startsWith("ERROR") || line.includes("Build failed") || line.includes("RollupError")
                                    ? "text-red-400"
                                    : line.startsWith("✓")
                                    ? "text-[#4ec9b0]"
                                    : line.startsWith("$")
                                    ? "text-primary/80"
                                    : "text-white/40"
                            }`}>
                                {line || <>&nbsp;</>}
                            </div>
                        ))}
                        {currentLine !== null && (
                            <div className={`leading-5 ${
                                currentLine.startsWith("ERROR") || currentLine.includes("Build failed")
                                    ? "text-red-400"
                                    : currentLine.startsWith("$")
                                    ? "text-primary/80"
                                    : "text-white/40"
                            }`}>
                                {currentLine}
                                <span className="animate-pulse">▌</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── 상태 바 ──────────────────────────────── */}
            <div className="flex items-center justify-between px-3 h-6 bg-red-600/80 text-white/90 text-[10px] font-mono shrink-0">
                <div className="flex items-center gap-3">
                    <span>⚠ 1 error</span>
                    <span className="opacity-60">Ln 4, Col 1</span>
                </div>
                <div className="flex items-center gap-3 opacity-70">
                    <span>UTF-8</span>
                    <span>TypeScript React</span>
                    <span>Pretendard</span>
                </div>
            </div>
        </section>
    );
};
