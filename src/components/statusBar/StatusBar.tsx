import { uiText } from "../../utils/uiText";
import {useContext, useEffect, useState} from "react";
import {LuGitBranch} from "react-icons/lu";
import {LayoutContext} from "../../context/LayoutContext";
import {useCheckedMobileSize} from "../../hooks/useCheckedMobileSize";
import {useMatchedRoute} from "../../hooks/useMatchedRoute";
import {getFileIcon} from "../../constants/fileIcons";
import {VSCODE_DARK} from "../../constants/vscodeTheme";

const GIT_SUMMARY_UPDATED_EVENT = "portfolio-git-summary-updated";

// fullWidth: 사이드바가 없는 화면(블로그 글, 404)에서는 왼쪽 여백 없이 전체 너비로 표시
export const StatusBar = ({fullWidth = false}: {fullWidth?: boolean}) => {
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
            role="group"
            aria-label={uiText("상태 표시줄")}
            className="fixed bottom-0 right-0 h-6 z-30 flex items-center justify-between px-3 text-2xs font-mono select-none"
            style={{
                // body 의 좌측 safe-area 여백만큼 줄여 사이드바 오른쪽에서 시작하고, 우측 노치 영역은 배경만 채우고 글자는 안쪽에
                width: fullWidth ? "100%" : `calc(100% - ${layoutState.resizeSidebarWidth}px - env(safe-area-inset-left, 0px))`,
                paddingRight: "calc(0.75rem + env(safe-area-inset-right, 0px))",
                ...(fullWidth ? { paddingLeft: "calc(0.75rem + env(safe-area-inset-left, 0px))" } : {}),
                backgroundColor: "#17659a",
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
            <div className="flex items-center gap-3">
                <span>UTF-8</span>
                <span>{languageLabel}</span>
                <span>Pretendard</span>
            </div>
        </div>
    );
};
