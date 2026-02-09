import { useContext, useEffect, useRef } from "react";
import { GlobalStateContext } from "../../context/GlobalState.context";
import { useDragging } from "../../hooks/useDragging";
import { Navbar } from "./navbar/Navbar";
import { Folder } from "./contents/folder/Folder";
import { NavType } from "./constants/Nav.type";
import { Search } from "./contents/search/Search";
import { GitControl } from "./contents/gitControl/GitControl";
import { Bookmarks } from "./contents/bookmarks/Bookmarks";
import { Settings } from "./contents/settings/Settings";

export const Aside = () => {
    const {
        layoutState,
        setLayoutState,
        selectedNav,
        setSelectedNav,
        selectedTheme,
    } = useContext(GlobalStateContext);
    const asideRef = useRef<HTMLDivElement>(null);
    const handleMouseDown = useDragging({ targetRef: asideRef, type: "sidebar" });

    const handleClickNav = (nav: NavType) => {
        if (selectedNav === nav) {
            setSelectedNav(null);
        } else {
            setSelectedNav(nav);
        }
    };

    useEffect(() => {
        setLayoutState((prev) => ({
            ...prev,
            resizeSidebarWidth: selectedNav ? 250 : 40,
        }));
    }, [selectedNav]);

    return (
        <aside
            ref={asideRef}
            style={{
                width: layoutState.resizeSidebarWidth,
            }}
            className={`translate-x-0 absolute left-0 top-0 h-screen transition-transform ease-in-out ${selectedTheme.mode} border-r border-sub-gary/30 flex z-20`}
        >
            <Navbar selectedNav={selectedNav} onClickNav={handleClickNav} />

            {selectedNav === NavType.FOLDER && <Folder />}
            {selectedNav === NavType.GIT_CONTROL && <GitControl />}
            {selectedNav === NavType.SEARCH && <Search />}
            {selectedNav === NavType.BOOKMARKS && <Bookmarks />}
            {selectedNav === NavType.SETTINGS && <Settings />}

            {selectedNav && (
                <div
                    role="separator"
                    aria-label="사이드바 너비 조절"
                    aria-orientation="vertical"
                    className={[
                        "absolute top-0 right-0 z-10 h-full",
                        // 모바일 터치 타겟 확장 (md 이상은 얇게)
                        "w-5 md:w-2",
                        // 터치 가능해 보이게: 얇은 배경 + 경계 + 눌림 피드백
                        "bg-linear-to-l from-slate-900/10 to-transparent",
                        "active:from-primary/20",
                        "transition-colors",
                        // 드래그 중 스크롤/제스처 간섭 방지
                        "touch-none select-none",
                        // 커서(데스크톱)
                        "cursor-ew-resize",
                        // 가운데 '그립' 표시
                        "flex items-center justify-center",
                    ].join(" ")}
                    style={{
                        WebkitTapHighlightColor: "transparent",
                        touchAction: "none",
                    }}
                    onPointerDown={handleMouseDown}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                >
                    {/* grip dots */}
                    <div className="flex flex-col gap-1.5 opacity-70">
                        <span className="block h-1 w-1 rounded-full bg-slate-400" />
                        <span className="block h-1 w-1 rounded-full bg-slate-400" />
                        <span className="block h-1 w-1 rounded-full bg-slate-400" />
                    </div>
                </div>
            )}
        </aside>
    );
};
