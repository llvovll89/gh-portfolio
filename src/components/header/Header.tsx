import { Link, useNavigate, useLocation, matchPath } from "react-router-dom";
import { routesPath } from "../../routes/route";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LayoutContext } from "../../context/LayoutContext";
import { NavigationContext } from "../../context/NavigationContext";
import { useThemeStyle } from "../../hooks/useThemeStyle";
import { Theme } from "./theme/Theme";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useRedirectionPage } from "../../hooks/useRedirectionPage";
import { useCheckedMobileSize } from "../../hooks/useCheckedMobileSize";
import { LAYOUT_CONSTANTS } from "../../constants/layout";

const HeaderClock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");

    return (
        <div className="h-full px-2 sm:px-3 md:px-4 flex items-center text-white/90 font-bold text-xs sm:text-sm select-none border-l border-sub-gary/10 user-select-none">
            {hours}:{minutes}
        </div>
    );
};

export const Header = () => {
    const { layoutState } = useContext(LayoutContext);
    const { selectedPathState, setSelectedPathState, setClosedTabs, pinnedTabs, setPinnedTabs } = useContext(NavigationContext);
    const { backgroundStyle, backgroundClass } = useThemeStyle();

    const navigate = useNavigate();
    const location = useLocation();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const isMobileSize = useCheckedMobileSize();

    useRedirectionPage();

    // 풀스크린 상태 감지
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // 풀스크린 토글 함수
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`풀스크린 전환 실패: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    // 전역에서 접근 가능하도록 window 객체에 저장 (F11 단축키 브릿지)
    useEffect(() => {
        window.toggleFullscreen = toggleFullscreen;
        return () => {
            delete window.toggleFullscreen;
        };
    }, [toggleFullscreen]);

    // 현재 URL과 탭 선택 상태를 동기화 (동적 라우트 포함)
    useEffect(() => {
        const matchedRoute = routesPath.find(
            (route) =>
                route.path !== "*" &&
                Boolean(matchPath({ path: route.path, end: true }, location.pathname)),
        );

        const nextPath = matchedRoute?.path;
        if (!nextPath) return;

        setSelectedPathState((prev) => {
            const hasPath = prev.list.includes(nextPath);
            const nextList = hasPath ? prev.list : [...prev.list, nextPath];

            if (hasPath && prev.state === nextPath) {
                return prev;
            }

            return {
                ...prev,
                list: nextList,
                state: nextPath,
            };
        });
    }, [location.pathname, setSelectedPathState]);

    const selectedStyle = (path: string) => {
        return {
            bgColor: selectedPathState.state === path ? "bg-sub-gary/20" : "",
        };
    };

    const orderedTabs = useMemo(() => {
        const pinnedSet = new Set(pinnedTabs);
        const pinned = selectedPathState.list.filter((path) => pinnedSet.has(path));
        const rest = selectedPathState.list.filter((path) => !pinnedSet.has(path));
        return [...pinned, ...rest];
    }, [pinnedTabs, selectedPathState.list]);

    const togglePinPath = (path: string) => {
        setPinnedTabs((prev) =>
            prev.includes(path)
                ? prev.filter((p) => p !== path)
                : [path, ...prev],
        );
    };

    const handleClosePAth = (path: string) => {
        setClosedTabs((prev) => [...prev, path]);
        setPinnedTabs((prev) => prev.filter((p) => p !== path));

        setSelectedPathState((prev) => {
            const idx = prev.list.indexOf(path);
            const newList = prev.list.filter((p) => p !== path);

            if (prev.state !== path) {
                return {
                    ...prev,
                    list: newList,
                };
            }

            let newState: string;

            if (newList.length === 0) {
                newState = "";
            } else if (idx > 0) {
                newState = newList[idx - 1]; // 왼쪽
            } else {
                newState = newList[0]; // 오른쪽
            }

            return {
                ...prev,
                list: newList,
                state: newState,
            };
        });
    };

    return (
        <>
            <header
                className={`${backgroundClass} absolute top-0 right-0 h-10 border-b border-sub-gary/10 flex items-center justify-between z-20 overflow-x-auto scrolls`}
                style={{
                    width: `calc(100% - ${isMobileSize ? LAYOUT_CONSTANTS.MOBILE_SIDEBAR_WIDTH : layoutState.resizeSidebarWidth}px)`,
                    ...backgroundStyle,
                }}
            >
                {/* 모바일 로고 */}
                {isMobileSize && (
                    <Link
                        to="/"
                        className="flex items-center h-full px-3 shrink-0 border-r border-sub-gary/20"
                        aria-label="홈으로"
                    >
                        <img
                            src="/assets/logo/GH_logo_small_white.png"
                            alt="logo"
                            className="h-5 w-auto object-contain"
                        />
                    </Link>
                )}

                <ul
                    id="header-tabs"
                    tabIndex={-1}
                    role="tablist"
                    aria-label="File tabs"
                    className={`flex items-center h-full flex-1 overflow-x-auto`}
                >
                    {orderedTabs.map((path) => {
                        const route = routesPath.find((r) => r.path === path);
                        if (!route) return null;
                        const isPinned = pinnedTabs.includes(route.path);
                        return (
                            <li
                                role="tab"
                                aria-selected={selectedPathState.state === route.path}
                                aria-controls={`tabpanel-${route.name}`}
                                tabIndex={selectedPathState.state === route.path ? 0 : -1}
                                onClick={() =>
                                    setSelectedPathState((prev) => ({
                                        ...prev,
                                        state: route.path,
                                    }))
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedPathState((prev) => ({
                                            ...prev,
                                            state: route.path,
                                        }));
                                    }
                                }}
                                key={route.path}
                                className={`${selectedStyle(route.path).bgColor
                                    } min-w-20 sm:min-w-24 md:min-w-30 w-max h-full border-r text-white border-sub-gary/30 text-[11px] sm:text-[12px] md:text-[13px] flex items-center cursor-pointer user-select-none gap-0.5 sm:gap-1 justify-center px-1.5 sm:px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-inset`}
                            >
                                <span className="text-xs sm:text-sm">📍</span>
                                <Link to={route.path} className="h-full">
                                    <span className="h-full flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
                                        {route.name}.tsx
                                    </span>
                                </Link>

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        togglePinPath(route.path);
                                    }}
                                    aria-label={isPinned ? `Unpin ${route.name} tab` : `Pin ${route.name} tab`}
                                    className={`h-full px-1 flex items-center justify-center cursor-pointer rounded transition-colors ${isPinned ? "text-amber-300" : "text-white/50 hover:text-white/80"}`}
                                    title={isPinned ? "고정 해제" : "탭 고정"}
                                >
                                    <span className="text-[11px] sm:text-xs">
                                        {isPinned ? "★" : "☆"}
                                    </span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleClosePAth(route.path);
                                    }}
                                    aria-label={`Close ${route.name} tab`}
                                    className="h-full px-2 sm:px-1.5 flex items-center justify-center cursor-pointer hover:bg-sub-gary/30 rounded transition-colors"
                                    title="닫기"
                                >
                                    <svg
                                        width="10"
                                        height="10"
                                        className="sm:w-3 sm:h-3"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M12 4L4 12M4 4L12 12"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {/* 우측 컨트롤 버튼들 */}
                <div className="flex items-center h-full border-l border-sub-gary/10 shrink-0">
                    {/* 뒤로 가기 버튼 */}
                    <button
                        onClick={() => navigate(-1)}
                        className="hidden sm:flex h-full px-3 sm:px-2 items-center justify-center cursor-pointer hover:bg-sub-gary/20 text-white/70 hover:text-white transition-colors"
                        title="뒤로 가기"
                    >
                        <svg
                            width="14"
                            height="14"
                            className="sm:w-4 sm:h-4"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M10 12L6 8L10 4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>

                    {/* 앞으로 가기 버튼 - 모바일에서 숨김 */}
                    <button
                        onClick={() => navigate(1)}
                        className="hidden sm:flex h-full px-3 sm:px-2 items-center justify-center cursor-pointer hover:bg-sub-gary/20 text-white/70 hover:text-white transition-colors border-l border-sub-gary/10"
                        title="앞으로 가기"
                    >
                        <svg
                            width="14"
                            height="14"
                            className="sm:w-4 sm:h-4"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M6 12L10 8L6 4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>

                    {/* 새로고침 버튼 */}
                    <button
                        onClick={() => navigate(0)}
                        className="hidden sm:flex h-full px-3 sm:px-2 items-center justify-center cursor-pointer hover:bg-sub-gary/20 text-white/70 hover:text-white transition-colors border-l border-sub-gary/10"
                        title="새로고침"
                    >
                        <svg
                            width="14"
                            height="14"
                            className="sm:w-4 sm:h-4"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C9.84954 2 11.5 2.87868 12.5607 4.25M12.5607 4.25V2M12.5607 4.25H10.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>

                    {/* 풀스크린 토글 버튼 - 모바일에서 숨김 */}
                    <button
                        onClick={toggleFullscreen}
                        className="hidden md:flex h-full items-center justify-center px-1.5 sm:px-2 cursor-pointer hover:bg-sub-gary/20 text-white/70 hover:text-white transition-colors border-l border-sub-gary/10"
                        title={isFullscreen ? "전체 화면 종료 (F11)" : "전체 화면 (F11)"}
                    >
                        {isFullscreen ? (
                            <svg
                                width="14"
                                height="14"
                                className="sm:w-4 sm:h-4"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M6 2H3C2.44772 2 2 2.44772 2 3V6M10 14H13C13.5523 14 14 13.5523 14 13V10M14 6V3C14 2.44772 13.5523 2 13 2H10M2 10V13C2 13.5523 2.44772 14 3 14H6"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        ) : (
                            <svg
                                width="14"
                                height="14"
                                className="sm:w-4 sm:h-4"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M2 6V3C2 2.44772 2.44772 2 3 2H6M14 10V13C14 13.5523 13.5523 14 13 14H10M10 2H13C13.5523 2 14 2.44772 14 3V6M6 14H3C2.44772 14 2 13.5523 2 13V10"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        )}
                    </button>

                    {/* 언어 전환 */}
                    <LanguageSwitcher />

                    {/* 시계 */}
                    {!isMobileSize && <HeaderClock />}
                </div>
            </header>

            <Theme />
        </>
    );
};
