import { useRef, type KeyboardEvent } from "react";
import { uiText } from "../../../utils/uiText";
import { FOOTER_TABS, type FooterTabType } from "../types";
import { TabButton } from "./TabButton";

interface FooterTabsProps {
    activeTab: FooterTabType;
    onTabChange: (tab: FooterTabType) => void;
}

export const FooterTabs = ({ activeTab, onTabChange }: FooterTabsProps) => {
    const tabRefs = useRef<Partial<Record<FooterTabType, HTMLButtonElement | null>>>({});

    // roving tabindex: 화살표/Home/End로 탭 이동 + 자동 활성화
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const currentIndex = FOOTER_TABS.findIndex((tab) => tab.id === activeTab);
        let nextIndex: number;
        switch (e.key) {
            case "ArrowRight":
                nextIndex = (currentIndex + 1) % FOOTER_TABS.length;
                break;
            case "ArrowLeft":
                nextIndex = (currentIndex - 1 + FOOTER_TABS.length) % FOOTER_TABS.length;
                break;
            case "Home":
                nextIndex = 0;
                break;
            case "End":
                nextIndex = FOOTER_TABS.length - 1;
                break;
            default:
                return;
        }
        e.preventDefault();
        const nextId = FOOTER_TABS[nextIndex].id;
        onTabChange(nextId);
        tabRefs.current[nextId]?.focus();
    };

    return (
        // ARIA tabs 패턴: 포커스는 개별 tab(roving tabindex)이 받고, 방향키 이벤트만 tablist에서 위임 처리
        // eslint-disable-next-line jsx-a11y-x/interactive-supports-focus
        <div
            role="tablist"
            aria-label={uiText("하단 패널 탭")}
            onKeyDown={handleKeyDown}
            className="flex items-center gap-0.5 border-b border-foreground/10"
        >
            {FOOTER_TABS.map((tab) => (
                <TabButton
                    key={tab.id}
                    ref={(el) => {
                        tabRefs.current[tab.id] = el;
                    }}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => onTabChange(tab.id)}
                />
            ))}
        </div>
    );
};
