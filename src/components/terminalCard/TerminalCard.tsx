import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Line {
    type: "cmd" | "out" | "blank";
    text: string;
}

const useTypewriter = (lines: Line[], speed = 40) => {
    const [displayed, setDisplayed] = useState<Line[]>([]);
    const [cursorVisible, setCursorVisible] = useState(true);
    const indexRef = useRef(0);
    const charRef = useRef(0);

    useEffect(() => {
        const prefersReduced =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReduced) {
            setDisplayed(lines);
            return;
        }

        setDisplayed([]);
        indexRef.current = 0;
        charRef.current = 0;

        let raf: number;
        let lastTime = 0;

        const tick = (now: number) => {
            if (now - lastTime < speed) {
                raf = requestAnimationFrame(tick);
                return;
            }
            lastTime = now;

            const i = indexRef.current;
            if (i >= lines.length) return;

            const line = lines[i];

            if (line.type === "blank") {
                setDisplayed((prev) => [...prev, line]);
                indexRef.current++;
                raf = requestAnimationFrame(tick);
                return;
            }

            const c = charRef.current;
            if (c === 0) {
                setDisplayed((prev) => [...prev, { ...line, text: "" }]);
            } else {
                setDisplayed((prev) => {
                    const next = [...prev];
                    next[next.length - 1] = { ...line, text: line.text.slice(0, c) };
                    return next;
                });
            }

            if (c < line.text.length) {
                charRef.current++;
            } else {
                indexRef.current++;
                charRef.current = 0;
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [lines, speed]);

    useEffect(() => {
        const id = setInterval(() => setCursorVisible((v) => !v), 530);
        return () => clearInterval(id);
    }, []);

    return { displayed, cursorVisible };
};

export const TerminalCard = () => {
    const { t } = useTranslation();

    const badge = t("pages.home.badge");
    const LINES: Line[] = useMemo(() => [
        { type: "cmd", text: "whoami" },
        { type: "out", text: "Geonho Kim · Frontend Developer" },
        { type: "blank", text: "" },
        { type: "cmd", text: "cat skills.txt" },
        { type: "out", text: "React  TypeScript  Tailwind" },
        { type: "out", text: "SpringBoot  PostgreSQL  Firebase" },
        { type: "blank", text: "" },
        { type: "cmd", text: "echo $status" },
        { type: "out", text: badge + " · Available ✓" },
        { type: "blank", text: "" },
        { type: "cmd", text: "cat location.txt" },
        { type: "out", text: "Seoul, South Korea 🇰🇷" },
    ], [badge]);

    const { displayed, cursorVisible } = useTypewriter(LINES, 38);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [displayed]);

    return (
        <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 font-mono text-sm">
            {/* 상단 바 */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1e1e1e] border-b border-white/8">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-[11px] text-white/30 select-none">
                    terminal — zsh
                </span>
            </div>

            {/* 본문 */}
            <div className="bg-[#141414] px-5 py-4 min-h-52 overflow-hidden">
                {displayed.map((line, i) => {
                    if (line.type === "blank") return <div key={i} className="h-2" />;

                    const isLast = i === displayed.length - 1;
                    const isCmd = line.type === "cmd";

                    return (
                        <div key={i} className="flex items-start gap-1.5 leading-6">
                            {isCmd && (
                                <span className="shrink-0 text-emerald-400 select-none">$</span>
                            )}
                            {!isCmd && (
                                <span className="shrink-0 text-white/20 select-none">›</span>
                            )}
                            <span className={isCmd ? "text-white/90" : "text-white/55"}>
                                {line.text}
                                {isLast && (
                                    <span
                                        className={`ml-0.5 inline-block w-2 h-4 align-text-bottom bg-primary transition-opacity duration-100 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                                    />
                                )}
                            </span>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
