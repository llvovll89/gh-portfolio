import type { FooterTab } from "../types";


interface TabButtonProps {
    tab: FooterTab;
    isActive: boolean;
    onClick: () => void;
}

export const TabButton = ({ tab, isActive, onClick }: TabButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-1.5 text-xs font-medium transition-all duration-200 border-b-2 hover:bg-white/5 ${
                isActive
                    ? "border-primary text-primary bg-white/5"
                    : "border-transparent text-white/60 hover:text-white/80"
            }`}
        >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            <span className="hidden sm:inline">{tab.label}</span>
        </button>
    );
};
