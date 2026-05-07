/**
 * 키보드 관련 상수 정의
 */

import type { KeyCombination } from "@/types/Keyboard.types";
import { KeyboardShortcutId } from "@/types/Keyboard.types";

/**
 * 레이아웃 높이 상수
 */
export const LAYOUT_HEIGHTS = {
    FOOTER_COLLAPSED: 32,
    FOOTER_OPEN: 220,
} as const;

/**
 * ESC 키 연속 입력 타이머
 */
export const ESC_DOUBLE_PRESS_TIMEOUT = 500;

/**
 * 키보드 입력을 제한할 HTML 태그
 */
export const RESTRICTED_TAGS = ["input", "select", "textarea"] as const;

/**
 * 기본 키보드 단축키 조합
 */
export const DEFAULT_KEY_COMBINATIONS: Record<
    KeyboardShortcutId,
    KeyCombination
> = {
    [KeyboardShortcutId.TOGGLE_FOOTER]: {
        key: "Backquote",
        ctrl: true,
    },
    [KeyboardShortcutId.TOGGLE_KEYBOARD_INFO]: {
        key: "F12",
        ctrl: true,
    },
    [KeyboardShortcutId.TOGGLE_FOLDER]: {
        key: "KeyY",
        ctrl: true,
    },
    [KeyboardShortcutId.TOGGLE_SEARCH]: {
        key: "KeyF",
        ctrl: true,
    },
    [KeyboardShortcutId.CLI_ENTER]: {
        key: "Enter",
        ctrl: true,
    },
    [KeyboardShortcutId.ALL_CLEAR]: {
        key: "Escape",
    },
    [KeyboardShortcutId.TOGGLE_SIDEBAR]: {
        key: "KeyB",
        ctrl: true,
    },
    [KeyboardShortcutId.TOGGLE_PANEL]: {
        key: "KeyJ",
        ctrl: true,
    },
    [KeyboardShortcutId.COMMAND_PALETTE]: {
        key: "KeyP",
        ctrl: true,
        shift: true,
    },
    [KeyboardShortcutId.TOGGLE_FULLSCREEN]: {
        key: "F11",
    },
    [KeyboardShortcutId.TOGGLE_GIT_CONTROL]: {
        key: "KeyG",
        ctrl: true,
        shift: true,
    },
    [KeyboardShortcutId.TOGGLE_BOOKMARKS]: {
        key: "KeyM",
        ctrl: true,
        shift: true,
    },
    [KeyboardShortcutId.TOGGLE_SETTINGS]: {
        key: "Comma",
        ctrl: true,
    },
    [KeyboardShortcutId.REOPEN_CLOSED_TAB]: {
        key: "KeyT",
        ctrl: true,
        shift: true,
    },
    [KeyboardShortcutId.TOGGLE_PIN_CURRENT_TAB]: {
        key: "KeyP",
        ctrl: true,
        alt: true,
    },
} as const;

/**
 * 키보드 단축키 설명 (한글)
 */
export const SHORTCUT_DESCRIPTIONS_KO: Record<KeyboardShortcutId, string> = {
    [KeyboardShortcutId.TOGGLE_FOOTER]: "푸터 터미널 열기/닫기",
    [KeyboardShortcutId.TOGGLE_KEYBOARD_INFO]: "키보드 단축키 정보",
    [KeyboardShortcutId.TOGGLE_FOLDER]: "폴더 패널 열기/닫기",
    [KeyboardShortcutId.TOGGLE_SEARCH]: "검색 패널 열기/닫기",
    [KeyboardShortcutId.CLI_ENTER]: "CLI 명령 실행",
    [KeyboardShortcutId.ALL_CLEAR]: "모든 모달 닫기 (2번 연속)",
    [KeyboardShortcutId.TOGGLE_SIDEBAR]: "사이드바 토글",
    [KeyboardShortcutId.TOGGLE_PANEL]: "하단 패널 토글",
    [KeyboardShortcutId.COMMAND_PALETTE]: "명령 팔레트 열기",
    [KeyboardShortcutId.TOGGLE_FULLSCREEN]: "전체 화면 토글",
    [KeyboardShortcutId.TOGGLE_GIT_CONTROL]: "Git Control 패널 열기/닫기",
    [KeyboardShortcutId.TOGGLE_BOOKMARKS]: "북마크 패널 열기/닫기",
    [KeyboardShortcutId.TOGGLE_SETTINGS]: "설정 패널 열기/닫기",
    [KeyboardShortcutId.REOPEN_CLOSED_TAB]: "닫힌 탭 다시 열기",
    [KeyboardShortcutId.TOGGLE_PIN_CURRENT_TAB]: "현재 탭 고정/해제",
} as const;

/**
 * 키보드 단축키 설명 (영문)
 */
export const SHORTCUT_DESCRIPTIONS_EN: Record<KeyboardShortcutId, string> = {
    [KeyboardShortcutId.TOGGLE_FOOTER]: "Toggle Footer Terminal",
    [KeyboardShortcutId.TOGGLE_KEYBOARD_INFO]: "Keyboard Shortcuts Info",
    [KeyboardShortcutId.TOGGLE_FOLDER]: "Toggle Folder Panel",
    [KeyboardShortcutId.TOGGLE_SEARCH]: "Toggle Search Panel",
    [KeyboardShortcutId.CLI_ENTER]: "Execute CLI Command",
    [KeyboardShortcutId.ALL_CLEAR]: "Close All Modals (Press Twice)",
    [KeyboardShortcutId.TOGGLE_SIDEBAR]: "Toggle Sidebar",
    [KeyboardShortcutId.TOGGLE_PANEL]: "Toggle Bottom Panel",
    [KeyboardShortcutId.COMMAND_PALETTE]: "Open Command Palette",
    [KeyboardShortcutId.TOGGLE_FULLSCREEN]: "Toggle Fullscreen",
    [KeyboardShortcutId.TOGGLE_GIT_CONTROL]: "Toggle Git Control Panel",
    [KeyboardShortcutId.TOGGLE_BOOKMARKS]: "Toggle Bookmarks Panel",
    [KeyboardShortcutId.TOGGLE_SETTINGS]: "Toggle Settings Panel",
    [KeyboardShortcutId.REOPEN_CLOSED_TAB]: "Reopen Closed Tab",
    [KeyboardShortcutId.TOGGLE_PIN_CURRENT_TAB]: "Toggle Pin Current Tab",
} as const;

/**
 * 키보드 단축키 설명 (일본어)
 */
export const SHORTCUT_DESCRIPTIONS_JA: Record<KeyboardShortcutId, string> = {
    [KeyboardShortcutId.TOGGLE_FOOTER]: "フッターターミナルを開く/閉じる",
    [KeyboardShortcutId.TOGGLE_KEYBOARD_INFO]: "キーボードショートカット情報",
    [KeyboardShortcutId.TOGGLE_FOLDER]: "フォルダパネルを開く/閉じる",
    [KeyboardShortcutId.TOGGLE_SEARCH]: "検索パネルを開く/閉じる",
    [KeyboardShortcutId.CLI_ENTER]: "CLIコマンドを実行",
    [KeyboardShortcutId.ALL_CLEAR]: "すべてのモーダルを閉じる（2回連続）",
    [KeyboardShortcutId.TOGGLE_SIDEBAR]: "サイドバーの切替",
    [KeyboardShortcutId.TOGGLE_PANEL]: "下部パネルの切替",
    [KeyboardShortcutId.COMMAND_PALETTE]: "コマンドパレットを開く",
    [KeyboardShortcutId.TOGGLE_FULLSCREEN]: "全画面の切替",
    [KeyboardShortcutId.TOGGLE_GIT_CONTROL]: "Git Controlパネルを開く/閉じる",
    [KeyboardShortcutId.TOGGLE_BOOKMARKS]: "ブックマークパネルを開く/閉じる",
    [KeyboardShortcutId.TOGGLE_SETTINGS]: "設定パネルを開く/閉じる",
    [KeyboardShortcutId.REOPEN_CLOSED_TAB]: "閉じたタブを再度開く",
    [KeyboardShortcutId.TOGGLE_PIN_CURRENT_TAB]: "現在のタブを固定/解除",
} as const;

/**
 * 키 조합을 사람이 읽을 수 있는 문자열로 변환
 */
export const formatKeyCombo = (combo: KeyCombination): string => {
    const parts: string[] = [];

    if (combo.ctrl) parts.push("Ctrl");
    if (combo.shift) parts.push("Shift");
    if (combo.alt) parts.push("Alt");
    if (combo.meta) parts.push("Meta");

    // 키 이름 변환
    let keyName = combo.key;
    if (keyName.startsWith("Key")) {
        keyName = keyName.replace("Key", "");
    } else if (keyName === "Backquote") {
        keyName = "`";
    } else if (keyName === "Escape") {
        keyName = "ESC";
    } else if (keyName === "Comma") {
        keyName = ",";
    }

    parts.push(keyName);

    return parts.join(" + ");
};

/**
 * 키 이벤트가 특정 조합과 일치하는지 확인
 */
export const matchesKeyCombination = (
    event: KeyboardEvent,
    combo: KeyCombination,
): boolean => {
    return (
        event.code === combo.key &&
        !!event.ctrlKey === !!combo.ctrl &&
        !!event.shiftKey === !!combo.shift &&
        !!event.altKey === !!combo.alt &&
        !!event.metaKey === !!combo.meta
    );
};
