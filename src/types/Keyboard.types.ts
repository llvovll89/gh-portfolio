/**
 * 키보드 이벤트 관련 타입 정의
 */

import type { NavType } from "@/components/aside/constants/Nav.type";
import type { LayoutState } from "@/context/GlobalState.context";
import type { submitCliCommandType } from "@/context/KeyboardState.context";

/**
 * 키 조합 정의
 */
export interface KeyCombination {
    key: string; // KeyboardEvent.code 값
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
}

/**
 * 키보드 단축키 정의
 */
export interface KeyboardShortcut {
    id: string;
    combination: KeyCombination;
    description: string;
    handler: KeyboardEventHandler;
    enabled?: boolean;
    customizable?: boolean;
}

/**
 * 키보드 이벤트 핸들러 타입들
 */
export type KeyboardEventHandler = (event: KeyboardEvent) => void;

export type LayoutStateHandler = (
    event: KeyboardEvent,
    setLayoutState: React.Dispatch<React.SetStateAction<LayoutState>>,
) => void;

export type NavStateHandler = (
    event: KeyboardEvent,
    setSelectedNav: React.Dispatch<React.SetStateAction<NavType | null>>,
) => void;

export type BooleanStateHandler = (
    event: KeyboardEvent,
    setState: React.Dispatch<React.SetStateAction<boolean>>,
) => void;

export type CliCommandHandler = (
    event: KeyboardEvent,
    setSubmitCliCommand: React.Dispatch<
        React.SetStateAction<submitCliCommandType>
    >,
) => void;

export type MultiStateHandler = (
    event: KeyboardEvent,
    setSubmitCliCommand: React.Dispatch<
        React.SetStateAction<submitCliCommandType>
    >,
    setIsVisibleKeyboardInfo: React.Dispatch<React.SetStateAction<boolean>>,
) => void;

export type TerminalStateHandler = (
    event: KeyboardEvent,
    setLayoutState: React.Dispatch<React.SetStateAction<LayoutState>>,
    setIsTerminalVisible: React.Dispatch<React.SetStateAction<boolean>>,
) => void;

/**
 * 키보드 설정 저장 타입
 */
export interface KeyboardSettings {
    shortcuts: Record<string, KeyCombination>;
    enabled: boolean;
}

/**
 * 키보드 단축키 ID 열거형
 */
export enum KeyboardShortcutId {
    TOGGLE_FOOTER = "toggle_footer",
    TOGGLE_KEYBOARD_INFO = "toggle_keyboard_info",
    TOGGLE_FOLDER = "toggle_folder",
    TOGGLE_SEARCH = "toggle_search",
    CLI_ENTER = "cli_enter",
    ALL_CLEAR = "all_clear",
    TOGGLE_SIDEBAR = "toggle_sidebar",
    TOGGLE_PANEL = "toggle_panel",
    COMMAND_PALETTE = "command_palette",
    TOGGLE_FULLSCREEN = "toggle_fullscreen",
}
