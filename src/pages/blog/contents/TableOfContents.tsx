import { useEffect, useState } from "react";
import type { TocItem } from "../../../utils/parseToc";
import { DETAIL_SCROLL_ID } from "./Detail";

interface Props {
    items: TocItem[];
}

export const TableOfContents = ({ items }: Props) => {
    const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

    useEffect(() => {
        if (items.length === 0) return;

        const container = document.getElementById(DETAIL_SCROLL_ID);
        if (!container) return;

        let rafId: number | null = null;

        const handleScroll = () => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                const containerRect = container.getBoundingClientRect();
                const threshold = containerRect.top + 80;

                let currentId = items[0]?.id ?? "";
                for (const item of items) {
                    const el = document.getElementById(item.id);
                    if (!el) continue;
                    if (el.getBoundingClientRect().top <= threshold) {
                        currentId = item.id;
                    }
                }
                setActiveId(currentId);
            });
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => {
            container.removeEventListener("scroll", handleScroll);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, [items]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const heading = document.getElementById(id);
        const container = document.getElementById(DETAIL_SCROLL_ID);
        if (!heading || !container) return;

        const containerRect = container.getBoundingClientRect();
        const headingRect = heading.getBoundingClientRect();
        const offset = headingRect.top - containerRect.top + container.scrollTop - 80;
        container.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
    };

    if (items.length === 0) return null;

    return (
        // sticky top-6: detail-content(h-dvh overflow-y-auto)가 스크롤 컨테이너이므로 정상 동작
        <nav
            aria-label="목차"
            className="hidden xl:block sticky top-6 self-start w-52 shrink-0"
        >
            <p className="text-xs font-semibold text-zinc-400 uppercase mb-3 tracking-widest">
                목차
            </p>
            <ul className="space-y-1 border-l border-zinc-200">
                {items.map((item) => (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            onClick={(e) => handleClick(e, item.id)}
                            className={`block text-[0.8rem] leading-snug py-1 border-l-2 -ml-px transition-colors duration-150
                                ${item.level === 3 ? "pl-5" : "pl-3"}
                                ${
                                    activeId === item.id
                                        ? "border-primary text-primary font-semibold"
                                        : "border-transparent text-zinc-400 hover:text-zinc-700 hover:border-zinc-300"
                                }`}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
