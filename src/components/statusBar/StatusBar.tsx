import {useContext, useEffect, useState} from "react";
import {LuGitBranch} from "react-icons/lu";
import {LayoutContext} from "../../context/LayoutContext";
import {useCheckedMobileSize} from "../../hooks/useCheckedMobileSize";
import {useMatchedRoute} from "../../hooks/useMatchedRoute";
import {getFileIcon} from "../../constants/fileIcons";
import {VSCODE_DARK} from "../../constants/vscodeTheme";

const GIT_SUMMARY_UPDATED_EVENT = "portfolio-git-summary-updated";

export const StatusBar = () => {
    const {layoutState} = useContext(LayoutContext);
    const isMobileSize = useCheckedMobileSize();
    const matchedRoute = useMatchedRoute();
    const [openCount, setOpenCount] = useState(0);

    useEffect(() => {
        const handleGitSummary = (event: Event) => {
            const customEvent = event as CustomEvent<{openCount?: number}>;
            setOpenCount(customEvent.detail?.openCount ?? 0);
        };
        window.addEventListener(GIT_SUMMARY_UPDATED_EVENT, handleGitSummary);
        return () =>
            window.removeEventListener(
                GIT_SUMMARY_UPDATED_EVENT,
                handleGitSummary,
            );
    }, []);

    if (isMobileSize) return null;

    const languageLabel = matchedRoute
        ? getFileIcon(matchedRoute.path).languageLabel
        : "TypeScript React";

    return (
        <div
            role="status"
            aria-label="상태 표시줄"
            className="fixed bottom-0 right-0 h-6 z-30 flex items-center justify-between px-3 text-[11px] font-mono select-none"
            style={{
                width: `calc(100% - ${layoutState.resizeSidebarWidth}px)`,
                backgroundColor: VSCODE_DARK.statusBarBg,
                color: VSCODE_DARK.statusBarFg,
            }}
        >
            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                    <LuGitBranch className="w-3 h-3" />
                    main
                </span>
                {openCount > 0 && (
                    <span className="opacity-90">⚠ {openCount} open</span>
                )}
            </div>
            <div className="flex items-center gap-3 opacity-90">
                <span>UTF-8</span>
                <span>{languageLabel}</span>
                <span>Pretendard</span>
            </div>
        </div>
    );
};
