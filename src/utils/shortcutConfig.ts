import { DEFAULT_KEY_COMBINATIONS } from "../constants/keyboardConstants";
import type { KeyCombination, KeyboardShortcutId } from "../types/Keyboard.types";

type ShortcutMap = Record<KeyboardShortcutId, KeyCombination>;

const STORAGE_KEY = "keyboard_shortcuts_config";

// 키 입력마다 저장소를 파싱하지 않도록 메모리에 두고, 저장·초기화 시에만 갱신
let cache: ShortcutMap | null = null;

/** 현재 적용 중인 단축키 (사용자 지정값이 있으면 기본값 위에 덮어씀) */
export function loadShortcuts(): ShortcutMap {
    if (cache) return cache;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? (JSON.parse(stored) as Partial<ShortcutMap>) : {};
        cache = { ...DEFAULT_KEY_COMBINATIONS, ...parsed };
    } catch (error) {
        console.error("Failed to load keyboard shortcuts:", error);
        cache = { ...DEFAULT_KEY_COMBINATIONS };
    }
    return cache;
}

/** 전역 단축키 처리기·명령 팔레트가 쓰는 단일 조회 경로 — 설정에서 바꾼 단축키가 실제 동작에도 반영되게 함 */
export const getShortcut = (id: KeyboardShortcutId): KeyCombination => loadShortcuts()[id];

/** 저장 실패 시 false (메모리 값은 갱신되어 현재 세션에는 적용됨) */
export function saveShortcuts(next: ShortcutMap): boolean {
    cache = next;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return true;
    } catch {
        return false;
    }
}

export function clearShortcuts() {
    cache = { ...DEFAULT_KEY_COMBINATIONS };
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("Failed to reset shortcuts:", error);
    }
}
