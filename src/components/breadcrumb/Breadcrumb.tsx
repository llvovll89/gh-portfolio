import {useContext} from "react";
import {LayoutContext} from "../../context/LayoutContext";
import {useThemeStyle} from "../../hooks/useThemeStyle";
import {useCheckedMobileSize} from "../../hooks/useCheckedMobileSize";
import {useMatchedRoute} from "../../hooks/useMatchedRoute";
import {getFileIcon} from "../../constants/fileIcons";

export const Breadcrumb = () => {
    const {layoutState} = useContext(LayoutContext);
    const {backgroundStyle, backgroundClass} = useThemeStyle();
    const isMobileSize = useCheckedMobileSize();
    const matchedRoute = useMatchedRoute();

    if (!matchedRoute) return null;

    const {Icon, colorClass} = getFileIcon(matchedRoute.path);

    // 모바일: 현재 페이지 이름만 간소화 표시
    if (isMobileSize) {
        return (
            <div
                role="navigation"
                aria-label="Breadcrumb"
                className={`absolute top-10 right-0 h-6 flex items-center gap-1.5 px-3 text-[11px] font-mono text-white/50 border-b border-sub-gary/10 z-20 ${backgroundClass}`}
                style={{width: "100%", ...backgroundStyle}}
            >
                <Icon aria-hidden="true" className={`w-3 h-3 shrink-0 ${colorClass}`} />
                <span className="text-white/70">{matchedRoute.name}</span>
            </div>
        );
    }

    return (
        <div
            role="navigation"
            aria-label="Breadcrumb"
            className={`absolute top-10 right-0 h-7 flex items-center gap-1.5 px-3 text-[11px] font-mono text-white/60 border-b border-sub-gary/10 z-20 ${backgroundClass}`}
            style={{
                width: `calc(100% - ${layoutState.resizeSidebarWidth}px)`,
                ...backgroundStyle,
            }}
        >
            <span>src</span>
            <span className="text-white/20">›</span>
            <span>pages</span>
            <span className="text-white/20">›</span>
            <Icon aria-hidden="true" className={`w-3 h-3 shrink-0 ${colorClass}`} />
            <span className="text-white/70">{matchedRoute.name}.tsx</span>
        </div>
    );
};
