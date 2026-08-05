/**
 * VS Code Dark+ 테마에서 가져온 공유 색상 토큰.
 * StatusBar/Breadcrumb/블로그 문법 강조 등 여러 컴포넌트가 공유해서 쓴다.
 */
export const VSCODE_DARK = {
    editorBg: "#1e1e1e",
    sidebarBg: "#252526",
    statusBarBg: "#007acc",
    statusBarFg: "#ffffff",
    border: "#3e3e42",
    activeSelectionBg: "#094771",
    hoverBg: "#2a2d2e",
    textPrimary: "#d4d4d4",
    textSecondary: "#858585",
    textMuted: "#6e6e6e",
} as const;

export const VSCODE_SYNTAX = {
    keyword: "#569cd6",
    string: "#ce9178",
    comment: "#6a9955",
    function: "#dcdcaa",
    tag: "#4ec9b0",
    attribute: "#9cdcfe",
    plain: "#d4d4d4",
    number: "#b5cea8",
    error: "#f14c4c",
} as const;

export type VSCodeSyntaxToken = keyof typeof VSCODE_SYNTAX;
