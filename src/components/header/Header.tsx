import {Link, useNavigate} from "react-router-dom";
import {routesPath} from "../../routes/route";
import {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";
import {Theme} from "./theme/Theme";
import {useRedirectionPage} from "../../hooks/useRedirectionPage";

export const Header = () => {
    const {
        layoutState,
        selectedPathState,
        setSelectedPathState,
        selectedTheme,
    } = useContext(GlobalStateContext);

    const navigate = useNavigate();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useRedirectionPage();

    // 시계 업데이트
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 풀스크린 상태 감지
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // 풀스크린 토글 함수
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`풀스크린 전환 실패: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // 전역에서 접근 가능하도록 window 객체에 저장
    useEffect(() => {
        (window as any).toggleFullscreen = toggleFullscreen;
        return () => {
            delete (window as any).toggleFullscreen;
        };
    }, []);

    const selectedStyle = (path: string) => {
        return {
            bgColor: selectedPathState.state === path ? "bg-sub-gary/20" : "",
        };
    };

    const handleClosePAth = (path: string) => {
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

    const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    return (
        <>
            <header
                className={`${selectedTheme.mode} absolute top-0 right-0 h-10 border-b border-sub-gary/10 flex items-center justify-between z-20 overflow-x-auto scrolls`}
                style={{
                    width: `calc(100% - ${layoutState.resizeSidebarWidth}px)`,
                }}
            >
                <ul className={`flex items-center h-full flex-1`}>
                    {selectedPathState.list.map((path) => {
                        const route = routesPath.find((r) => r.path === path);
                        if (!route) return null;
                        return (
                            <li
                                onClick={() =>
                                    setSelectedPathState((prev) => ({
                                        ...prev,
                                        state: route.path,
                                    }))
                                }
                                key={route.path}
                                className={`${
                                    selectedStyle(route.path).bgColor
                                } min-w-30 w-max h-full border-r text-white border-sub-gary/30 text-[13px] flex items-center cursor-pointer user-select-none gap-1 justify-center`}
                            >
                                <span className="">📍</span>
                                <Link to={route.path} className="h-full">
                                    <span className="h-full flex items-center">
                                        {route.name}.tsx
                                    </span>
                                </Link>

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleClosePAth(route.path);
                                    }}
                                    className="h-full w-4 cursor-pointer"
                                >
                                    <span className="text-white text-xs">
                                        X
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {/* 우측 컨트롤 버튼들 */}
                <div className="flex items-center h-full border-l border-sub-gary/10">
                    {/* 뒤로 가기 버튼 */}
                    <button
                        onClick={() => navigate(-1)}
                        className="h-full px-3 hover:bg-sub-gary/20 text-white/70 hover:text-white transition-colors"
                        title="뒤로 가기"
                    >
                        <svg
                            width="16"
                            height="16"
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

                    {/* 앞으로 가기 버튼 */}
                    <button
                        onClick={() => navigate(1)}
                        className="h-full px-3 hover:bg-sub-gary/20 text-white/70 hover:text-white transition-colors border-l border-sub-gary/10"
                        title="앞으로 가기"
                    >
                        <svg
                            width="16"
                            height="16"
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
                        onClick={() => window.location.reload()}
                        className="h-full px-3 hover:bg-sub-gary/20 text-white/70 hover:text-white transition-colors border-l border-sub-gary/10"
                        title="새로고침"
                    >
                        <svg
                            width="16"
                            height="16"
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

                    {/* 풀스크린 토글 버튼 */}
                    <button
                        onClick={toggleFullscreen}
                        className="h-full px-3 hover:bg-sub-gary/20 text-white/70 hover:text-white transition-colors border-l border-sub-gary/10"
                        title={isFullscreen ? "전체 화면 종료 (F11)" : "전체 화면 (F11)"}
                    >
                        {isFullscreen ? (
                            <svg
                                width="16"
                                height="16"
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
                                width="16"
                                height="16"
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

                    {/* 시계 */}
                    <div className="h-full px-4 flex items-center text-white/70 text-[13px] border-l border-sub-gary/10 user-select-none">
                        {formatTime(currentTime)}
                    </div>
                </div>
            </header>

            <Theme />
        </>
    );
};
