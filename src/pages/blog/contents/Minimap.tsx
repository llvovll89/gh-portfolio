import { useCallback, useEffect, useMemo, useRef, type MouseEvent } from "react";

const MINIMAP_W = 80;
const LINE_H = 2;

function getLineStyle(
    line: string,
    inCode: boolean,
): { color: string; widthRatio: number; indent: number } | null {
    if (line.trim() === "") return null;

    if (inCode) {
        const spaces = line.match(/^(\s*)/)?.[1].length ?? 0;
        return {
            color: "rgba(100, 200, 130, 0.35)",
            widthRatio: Math.min(0.9, Math.max(0.05, line.trim().length / 60)),
            indent: Math.min(spaces * 0.5, 12),
        };
    }

    if (/^# /.test(line))
        return { color: "rgba(130, 190, 255, 0.95)", widthRatio: 1, indent: 0 };
    if (/^## /.test(line))
        return { color: "rgba(130, 190, 255, 0.75)", widthRatio: 0.92, indent: 4 };
    if (/^#{3,} /.test(line))
        return { color: "rgba(130, 190, 255, 0.55)", widthRatio: 0.82, indent: 8 };
    if (line.startsWith("```"))
        return { color: "rgba(100, 200, 130, 0.6)", widthRatio: 1, indent: 0 };
    if (line.startsWith("> "))
        return { color: "rgba(250, 190, 80, 0.5)", widthRatio: Math.min(0.9, line.trim().length / 80), indent: 4 };
    if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\. /.test(line))
        return { color: "rgba(180, 140, 255, 0.5)", widthRatio: Math.min(0.85, line.trim().length / 80), indent: 2 };

    const trimLen = line.trim().length;
    if (trimLen === 0) return null;

    return {
        color: "rgba(180, 180, 180, 0.22)",
        widthRatio: Math.min(1, Math.max(0.05, trimLen / 80)),
        indent: 0,
    };
}

interface MinimapProps {
    content: string;
    scrollContainerId: string;
}

export const Minimap = ({ content, scrollContainerId }: MinimapProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollRatioRef = useRef(0);
    const viewportRatioRef = useRef(0.2);

    const lines = useMemo(() => content.split("\n"), [content]);
    const canvasHeight = useMemo(() => Math.min(lines.length * LINE_H, 680), [lines.length]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, MINIMAP_W, canvasHeight);

        let inCode = false;

        lines.forEach((line, i) => {
            const y = i * LINE_H;
            if (y >= canvasHeight) return;

            if (line.startsWith("```")) {
                inCode = !inCode;
                ctx.fillStyle = "rgba(100, 200, 130, 0.55)";
                ctx.fillRect(0, y, MINIMAP_W, LINE_H);
                return;
            }

            const style = getLineStyle(line, inCode);
            if (!style) return;

            const w = Math.max(3, style.widthRatio * (MINIMAP_W - style.indent));
            ctx.fillStyle = style.color;
            ctx.fillRect(style.indent, y, w, LINE_H - 0.5);
        });

        // viewport overlay
        const vpY = scrollRatioRef.current * canvasHeight;
        const vpH = Math.max(viewportRatioRef.current * canvasHeight, 18);

        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(0, vpY, MINIMAP_W, vpH);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, vpY + 0.5, MINIMAP_W - 1, vpH - 1);
    }, [lines, canvasHeight]);

    useEffect(() => {
        const container = document.getElementById(scrollContainerId);
        if (!container) return;

        let rafId: number | null = null;

        const onScroll = () => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                const { scrollTop, scrollHeight, clientHeight } = container;
                const max = scrollHeight - clientHeight;
                scrollRatioRef.current = max > 0 ? scrollTop / max : 0;
                viewportRatioRef.current = scrollHeight > 0 ? clientHeight / scrollHeight : 1;
                draw();
            });
        };

        container.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => {
            container.removeEventListener("scroll", onScroll);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, [scrollContainerId, draw]);

    useEffect(() => {
        draw();
    }, [draw]);

    const handleClick = (e: MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const container = document.getElementById(scrollContainerId);
        if (!canvas || !container) return;

        const rect = canvas.getBoundingClientRect();
        const ratio = (e.clientY - rect.top) / rect.height;
        const { scrollHeight, clientHeight } = container;
        container.scrollTo({
            top: ratio * (scrollHeight - clientHeight),
            behavior: "smooth",
        });
    };

    return (
        <div className="fixed right-0 top-0 h-dvh hidden xl:flex items-center pr-0.5 z-30 pointer-events-none">
            <canvas
                ref={canvasRef}
                width={MINIMAP_W}
                height={canvasHeight}
                onClick={handleClick}
                className="pointer-events-auto opacity-40 hover:opacity-85 transition-opacity duration-200 cursor-pointer rounded-sm"
                title="미니맵 — 클릭해서 이동"
            />
        </div>
    );
};
