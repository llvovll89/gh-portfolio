import type { ReactNode } from "react";

export type FooterTabType = "terminal" | "console";

export interface FooterTab {
    id: FooterTabType;
    label: string;
    icon?: ReactNode;
}

export const FOOTER_TABS: FooterTab[] = [
    { id: "terminal", label: "TERMINAL" },
    { id: "console", label: "CONSOLE" },
];
