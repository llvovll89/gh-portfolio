import { useContext, useEffect, useRef, useState } from "react";
import { KeyboardContext } from "@/context/KeyboardState.context";
import { GlobalStateContext } from "@/context/GlobalState.context";
import { NavType } from "@/components/aside/constants/Nav.type";
import {
    DEFAULT_KEY_COMBINATIONS,
    formatKeyCombo,
    LAYOUT_HEIGHTS,
    SHORTCUT_DESCRIPTIONS_KO,
} from "@/constants/keyboardConstants";
import { KeyboardShortcutId } from "@/types/Keyboard.types";
import { useFocusTrap } from "@/hooks/useKeyboardNavigation";

interface Command {
    id: string;
    label: string;
    shortcut: string;
    action: () => void;
}

/**
 * 명령 팔레트 컴포넌트
 * @description Ctrl+Shift+P로 호출되는 VS Code 스타일 명령 팔레트
 */
export const CommandPalette = () => {
    const {
        isVisibleCommandPalette,
        setIsVisibleCommandPalette,
        toggleKeyboardInfo,
    } = useContext(KeyboardContext);
    const {setLayoutState, setSelectedNav} = useContext(GlobalStateContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useFocusTrap(isVisibleCommandPalette);

    // 사용 가능한 명령 목록
    const commands: Command[] = [
        {
            id: KeyboardShortcutId.TOGGLE_KEYBOARD_INFO,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_KEYBOARD_INFO],
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_KEYBOARD_INFO],
            ),
            action: toggleKeyboardInfo,
        },
        {
            id: KeyboardShortcutId.TOGGLE_FOOTER,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_FOOTER],
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_FOOTER],
            ),
            action: () => {
                setLayoutState((prev) => {
                    const isOpen =
                        prev.resizeFooterHeight > LAYOUT_HEIGHTS.FOOTER_COLLAPSED;
                    return {
                        ...prev,
                        resizeFooterHeight: isOpen
                            ? LAYOUT_HEIGHTS.FOOTER_COLLAPSED
                            : LAYOUT_HEIGHTS.FOOTER_OPEN,
                    };
                });
            },
        },
        {
            id: KeyboardShortcutId.TOGGLE_FOLDER,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_FOLDER],
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_FOLDER],
            ),
            action: () => {
                setSelectedNav((prev) =>
                    prev === NavType.FOLDER ? null : NavType.FOLDER,
                );
            },
        },
        {
            id: KeyboardShortcutId.TOGGLE_SEARCH,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_SEARCH],
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_SEARCH],
            ),
            action: () => {
                setSelectedNav((prev) =>
                    prev === NavType.SEARCH ? null : NavType.SEARCH,
                );
            },
        },
        {
            id: KeyboardShortcutId.TOGGLE_SIDEBAR,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_SIDEBAR],
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_SIDEBAR],
            ),
            action: () => {
                setLayoutState((prev) => ({
                    ...prev,
                    resizeSidebarWidth: prev.resizeSidebarWidth > 0 ? 0 : 250,
                }));
            },
        },
        {
            id: KeyboardShortcutId.TOGGLE_PANEL,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_PANEL],
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_PANEL],
            ),
            action: () => {
                setLayoutState((prev) => {
                    const isOpen =
                        prev.resizeFooterHeight > LAYOUT_HEIGHTS.FOOTER_COLLAPSED;
                    return {
                        ...prev,
                        resizeFooterHeight: isOpen
                            ? LAYOUT_HEIGHTS.FOOTER_COLLAPSED
                            : LAYOUT_HEIGHTS.FOOTER_OPEN,
                    };
                });
            },
        },
    ];

    // 검색 필터링
    const filteredCommands = commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // 팔레트가 열릴 때 입력창 포커스
    useEffect(() => {
        if (isVisibleCommandPalette && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isVisibleCommandPalette]);

    // 키보드 네비게이션
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev < filteredCommands.length - 1 ? prev + 1 : prev,
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            executeCommand(filteredCommands[selectedIndex]);
        } else if (e.key === "Escape") {
            e.preventDefault();
            closeCommandPalette();
        }
    };

    const executeCommand = (command: Command | undefined) => {
        if (command && command.action) {
            command.action();
        }
        closeCommandPalette();
    };

    const closeCommandPalette = () => {
        setIsVisibleCommandPalette(false);
        setSearchQuery("");
        setSelectedIndex(0);
    };

    if (!isVisibleCommandPalette) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24"
            onClick={closeCommandPalette}
            role="dialog"
            aria-modal="true"
            aria-label="명령 팔레트"
        >
            <div
                ref={containerRef}
                className="w-full max-w-2xl rounded-lg bg-[#252526] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 검색 입력 */}
                <div className="border-b border-[#3e3e42] p-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="명령을 입력하세요..."
                        className="w-full bg-transparent text-[#cccccc] outline-none placeholder:text-[#6e6e6e]"
                        role="combobox"
                        aria-expanded="true"
                        aria-controls="command-list"
                        aria-activedescendant={`command-${selectedIndex}`}
                    />
                </div>

                {/* 명령 목록 */}
                <div
                    id="command-list"
                    className="max-h-96 overflow-y-auto"
                    role="listbox"
                >
                    {filteredCommands.length === 0 ? (
                        <div className="p-4 text-center text-[#6e6e6e]">
                            명령을 찾을 수 없습니다
                        </div>
                    ) : (
                        filteredCommands.map((command, index) => (
                            <button
                                key={command.id}
                                id={`command-${index}`}
                                onClick={() => executeCommand(command)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${index === selectedIndex
                                        ? "bg-[#094771] text-white"
                                        : "text-[#cccccc] hover:bg-[#2a2d2e]"
                                    }`}
                                role="option"
                                aria-selected={index === selectedIndex}
                            >
                                <span>{command.label}</span>
                                <span className="text-xs text-[#858585]">
                                    {command.shortcut}
                                </span>
                            </button>
                        ))
                    )}
                </div>

                {/* 하단 정보 */}
                <div className="border-t border-[#3e3e42] px-4 py-2 text-xs text-[#858585]">
                    ↑↓로 이동 • Enter로 실행 • ESC로 닫기
                </div>
            </div>
        </div>
    );
};
