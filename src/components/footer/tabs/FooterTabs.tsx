import { FOOTER_TABS, type FooterTabType } from "../types";
import { TabButton } from "./TabButton";

interface FooterTabsProps {
    activeTab: FooterTabType;
    onTabChange: (tab: FooterTabType) => void;
}

export const FooterTabs = ({ activeTab, onTabChange }: FooterTabsProps) => {
    return (
        <div className="flex items-center gap-0.5 border-b border-white/10">
            {FOOTER_TABS.map((tab) => (
                <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => onTabChange(tab.id)}
                />
            ))}
        </div>
    );
};
