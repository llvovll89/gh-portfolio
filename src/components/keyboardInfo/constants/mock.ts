import { KeyboardShortcutId } from "../../../types/Keyboard.types";

interface KeyboardKeyAndState {
    /** 표시용 기본 키 (설정으로 바꿀 수 없는 항목) */
    key: string;
    /** 설정에서 바꿀 수 있는 단축키면 id — 안내에는 현재 적용 중인 조합을 표시 */
    id?: KeyboardShortcutId;
    label: string;
}

export const keyboardKeyAndStateMock: KeyboardKeyAndState[] = [
    {
        key: "Ctrl + Y",
        id: KeyboardShortcutId.TOGGLE_FOLDER,
        label: "폴더 열기/닫기",
    },
    {
        key: "Ctrl + Shift + F",
        id: KeyboardShortcutId.TOGGLE_SEARCH,
        label: "검색 열기/닫기",
    },
    {
        key: "Ctrl + B",
        id: KeyboardShortcutId.TOGGLE_SIDEBAR,
        label: "사이드바 토글",
    },
    {
        key: "Ctrl + `",
        id: KeyboardShortcutId.TOGGLE_FOOTER,
        label: "푸터 터미널 열기/닫기",
    },
    {
        key: "Ctrl + J",
        id: KeyboardShortcutId.TOGGLE_PANEL,
        label: "하단 패널 토글",
    },
    {
        key: "Ctrl + Shift + P",
        id: KeyboardShortcutId.COMMAND_PALETTE,
        label: "명령 팔레트 열기",
    },
    {
        key: "Ctrl + F12",
        id: KeyboardShortcutId.TOGGLE_KEYBOARD_INFO,
        label: "키보드 단축키 정보 모달 열기/닫기",
    },
    {
        key: "Enter",
        label: "입력창 입력 후 실행",
    },
    {
        key: "Escape (2번 연속)",
        label: "모든 모달/입력 모드 닫기",
    },
    {
        key: "Tab / Shift + Tab",
        label: "포커스 이동 (순방향 / 역방향)",
    },
    {
        key: "↑ / ↓",
        label: "목록 항목 이동",
    },
];
