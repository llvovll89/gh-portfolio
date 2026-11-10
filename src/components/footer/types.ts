import type { ReactNode } from "react";

export const FOOTER_TAB_IDS = ["problems", "output", "terminal", "console"] as const;
export type FooterTabType = (typeof FOOTER_TAB_IDS)[number];

export interface FooterTab {
    id: FooterTabType;
    label: string;
    icon?: ReactNode;
}

export const FOOTER_TABS: FooterTab[] = [
    { id: "problems", label: "PROBLEMS" },
    { id: "output", label: "OUTPUT" },
    { id: "terminal", label: "TERMINAL" },
    { id: "console", label: "CONSOLE" },
];
