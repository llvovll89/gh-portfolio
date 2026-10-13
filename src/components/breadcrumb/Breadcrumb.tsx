import { useTranslation } from "react-i18next";
import {useContext} from "react";
import { useLocation } from "react-router-dom";
import {LayoutContext} from "../../context/LayoutContext";
import {useThemeStyle} from "../../hooks/useThemeStyle";
import {useCheckedMobileSize} from "../../hooks/useCheckedMobileSize";
import {useMatchedRoute} from "../../hooks/useMatchedRoute";
import {getFileIcon} from "../../constants/fileIcons";

export const Breadcrumb = () => {
    const { t } = useTranslation();
    const {layoutState} = useContext(LayoutContext);
    const {backgroundStyle, backgroundClass} = useThemeStyle();
    const isMobileSize = useCheckedMobileSize();
    const matchedRoute = useMatchedRoute();
    const location = useLocation();
    const fileName = matchedRoute?.path.includes(":") ? location.pathname.split("/").pop() : matchedRoute?.name;

    if (!matchedRoute) return null;

    const {Icon, colorClass} = getFileIcon(matchedRoute.path);

    // 모바일: 현재 페이지 이름만 간소화 표시
    if (isMobileSize) {
        return (
            <div
                role="navigation"
                aria-label={t("accessibility.breadcrumb")}
                className={`absolute top-10 right-0 h-6 flex items-center gap-1.5 px-3 text-[11px] font-mono text-muted border-b border-sub-gary/10 z-20 ${backgroundClass}`}
                style={{width: "100%", ...backgroundStyle}}
            >
                <Icon aria-hidden="true" className={`w-3 h-3 shrink-0 ${colorClass}`} />
                <span className="text-muted">{fileName}</span>
            </div>
        );
    }

    return (
        <div
            role="navigation"
            aria-label={t("accessibility.breadcrumb")}
            className={`absolute top-10 right-0 h-7 flex items-center gap-1.5 px-3 text-[11px] font-mono text-muted border-b border-sub-gary/10 z-20 ${backgroundClass}`}
            style={{
                width: `calc(100% - ${layoutState.resizeSidebarWidth}px)`,
                ...backgroundStyle,
            }}
        >
            <span>src</span>
            <span className="text-muted">›</span>
            <span>pages</span>
            <span className="text-muted">›</span>
            <Icon aria-hidden="true" className={`w-3 h-3 shrink-0 ${colorClass}`} />
            <span className="text-muted">{fileName}.tsx</span>
        </div>
    );
};
