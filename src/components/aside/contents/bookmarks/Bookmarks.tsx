import { useContext, useState, useEffect } from "react";
import { GlobalStateContext } from "../../../../context/GlobalState.context";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import {
    routesPath,
    DEFAULT,
    NOT_FOUND,
    BLOG_DETAIL,
} from "../../../../routes/route";
import { ThemeMode } from "../../../../context/constatns/Theme.type";
import {
    VscBookmark,
    VscTrash,
    VscAdd,
    VscStarFull,
} from "react-icons/vsc";
import { useTranslation } from "react-i18next";

interface Bookmark {
    id: string;
    path: string;
    name: string;
    addedAt: number;
}

export const Bookmarks = () => {
    const { selectedTheme, selectedPathState } =
        useContext(GlobalStateContext);
    const handlePushPath = useHandlePushPath();
    const { t } = useTranslation();

    // 커스텀 테마 적용
    const backgroundStyle = selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
        ? { backgroundColor: selectedTheme.customColor }
        : {};

    const backgroundClass = selectedTheme.mode === ThemeMode.CUSTOM
        ? ""
        : selectedTheme.mode;

    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [customPath, setCustomPath] = useState("");
    const [customName, setCustomName] = useState("");

    const availablePages = routesPath.filter(
        (r) =>
            r.path !== NOT_FOUND &&
            r.path !== DEFAULT &&
            r.path !== BLOG_DETAIL,
    );

    useEffect(() => {
        const stored = localStorage.getItem("portfolio-bookmarks");
        if (stored) {
            setBookmarks(JSON.parse(stored));
        }
    }, []);

    const saveBookmarks = (bks: Bookmark[]) => {
        localStorage.setItem("portfolio-bookmarks", JSON.stringify(bks));
        setBookmarks(bks);
    };

    const handleAddBookmark = (path: string, name: string) => {
        const exists = bookmarks.some((bk) => bk.path === path);
        if (exists) {
            alert("이미 추가된 북마크입니다.");
            return;
        }

        const bookmark: Bookmark = {
            id: Date.now().toString(),
            path,
            name,
            addedAt: Date.now(),
        };

        saveBookmarks([...bookmarks, bookmark]);
        setShowAddForm(false);
        setCustomPath("");
        setCustomName("");
    };

    const handleRemoveBookmark = (id: string) => {
        const updated = bookmarks.filter((bk) => bk.id !== id);
        saveBookmarks(updated);
    };

    const handleClickBookmark = (path: string) => {
        handlePushPath(path);
    };

    return (
        <section
            className={`w-full flex flex-col ${backgroundClass} overflow-hidden`}
            style={backgroundStyle}
        >
            <header className="w-full h-10 px-3 flex items-center justify-between text-xs text-white overflow-hidden tracking-[1px]">
                <span>{t("bookmarks.title")}</span>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="hover:bg-primary/20 p-1 rounded transition-colors"
                    aria-label={t("common.add")}
                >
                    <VscAdd className="w-4 h-4" />
                </button>
            </header>

            <div className="w-full h-[calc(100%-40px)] overflow-y-auto">
                {showAddForm && (
                    <div className="p-3 border-b border-sub-gary/30 space-y-3">
                        <p className="text-[10px] text-white/70 mb-2">
                            {t("bookmarks.selectPage")}
                        </p>

                        {/* 커스텀 북마크 추가 */}
                        <div className="space-y-2 pb-2 border-b border-sub-gary/20">
                            <input
                                type="text"
                                placeholder="북마크 이름 (예: React 블로그)"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs bg-sub-gary/20 text-white rounded border border-white/10 focus:border-primary/50 focus:outline-none placeholder:text-white/40"
                            />
                            <input
                                type="text"
                                placeholder="경로 (예: /blog/react-hooks)"
                                value={customPath}
                                onChange={(e) => setCustomPath(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs bg-sub-gary/20 text-white rounded border border-white/10 focus:border-primary/50 focus:outline-none placeholder:text-white/40"
                            />
                            <button
                                onClick={() => {
                                    if (customName.trim() && customPath.trim()) {
                                        handleAddBookmark(customPath.trim(), customName.trim());
                                    } else {
                                        alert("이름과 경로를 모두 입력해주세요.");
                                    }
                                }}
                                className="w-full px-2 py-1.5 text-xs bg-primary/80 text-white rounded hover:bg-primary transition-colors"
                            >
                                커스텀 북마크 추가
                            </button>
                        </div>

                        {/* 기존 페이지 목록 */}
                        <p className="text-[10px] text-white/70">또는 페이지에서 선택:</p>
                        <ul className="space-y-1">
                            {availablePages.map((page) => (
                                <li key={page.path}>
                                    <button
                                        onClick={() =>
                                            handleAddBookmark(page.path, t(page.name))
                                        }
                                        className="w-full text-left px-2 py-1.5 text-xs bg-sub-gary/20 text-white rounded hover:bg-primary/20 transition-colors"
                                    >
                                        {t(page.name)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setCustomPath("");
                                setCustomName("");
                            }}
                            className="w-full mt-2 px-2 py-1 text-xs bg-sub-gary/20 text-white rounded hover:bg-sub-gary/30 transition-colors"
                        >
                            {t("common.cancel")}
                        </button>
                    </div>
                )}

                {bookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/50 text-xs p-3">
                        <VscBookmark className="w-12 h-12 mb-2 opacity-30" />
                        <p>{t("bookmarks.noBookmarks")}</p>
                        <p className="text-[10px] mt-1">{t("bookmarks.addPrompt")}</p>
                    </div>
                ) : (
                    <ul className="w-full">
                        {bookmarks.map((bookmark) => (
                            <li
                                key={bookmark.id}
                                className={`${selectedPathState.state === bookmark.path
                                        ? "bg-sub-gary/20"
                                        : ""
                                    } w-full flex items-center gap-2 px-3 py-2 text-white cursor-pointer text-xs hover:bg-primary/20 border-b border-sub-gary/30`}
                            >
                                <VscStarFull className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                <span
                                    onClick={() => handleClickBookmark(bookmark.path)}
                                    className="flex-1 truncate"
                                >
                                    {bookmark.name}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveBookmark(bookmark.id);
                                    }}
                                    className="hover:bg-primary/20 p-1 rounded transition-colors flex-shrink-0"
                                    aria-label={t("common.delete")}
                                >
                                    <VscTrash className="w-3 h-3 text-white/70 hover:text-white" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};
