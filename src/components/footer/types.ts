import type { ReactNode } from "react";

export type FooterTabType = "problems" | "output" | "terminal" | "console";

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
