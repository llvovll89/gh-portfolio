import { uiText } from "../../../utils/uiText";
import { useEffect, useRef, useState } from "react";
import type { TocItem } from "../../../utils/parseToc";
import { HEADING_SCROLL_OFFSET, scrollToHeading } from "../../../utils/scrollToHeading";
import { isPlainLeftClick } from "../../../utils/isPlainLeftClick";
import { DETAIL_SCROLL_ID } from "./Detail";

interface Props {
    items: TocItem[];
}

export const TableOfContents = ({ items }: Props) => {
    const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
    const navRef = useRef<HTMLElement>(null);

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
                // 클릭 이동 후 서브픽셀 반올림(80.2px 등)으로 바로 위 항목이 활성화되지 않도록 여유 2px
                const threshold = containerRect.top + HEADING_SCROLL_OFFSET + 2;

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

    // 목차가 화면보다 길 때 현재 위치 항목이 목차 스크롤 영역 밖으로 나가지 않게 함
    useEffect(() => {
        const nav = navRef.current;
        const active = nav?.querySelector<HTMLElement>('[aria-current="location"]');
        if (!nav || !active) return;
        const navRect = nav.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        if (activeRect.top < navRect.top || activeRect.bottom > navRect.bottom) {
            nav.scrollTop += activeRect.top - navRect.top - nav.clientHeight / 2;
        }
    }, [activeId]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        if (!isPlainLeftClick(e)) return;
        e.preventDefault();
        scrollToHeading(id, DETAIL_SCROLL_ID);
    };

    if (items.length === 0) return null;

    return (
        // sticky top-6: detail-content(h-dvh overflow-y-auto)가 스크롤 컨테이너이므로 정상 동작
        <nav
            ref={navRef}
            aria-label={uiText("목차")}
            className="hidden xl:block sticky top-6 self-start w-52 shrink-0 max-h-[calc(100dvh-3rem)] overflow-y-auto scrolls"
        >
            <p className="text-xs font-semibold text-muted uppercase mb-3 tracking-widest">
                {uiText("목차")}</p>
            <ul className="space-y-1 border-l border-line">
                {items.map((item) => (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            onClick={(e) => handleClick(e, item.id)}
                            aria-current={activeId === item.id ? "location" : undefined}
                            className={`block text-[0.8rem] leading-snug py-1 border-l-2 -ml-px transition-colors duration-150
                                ${item.level === 3 ? "pl-5" : "pl-3"}
                                ${
                                    activeId === item.id
                                        ? "border-primary text-primary font-semibold"
                                        : "border-transparent text-muted hover:text-foreground hover:border-line"
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
