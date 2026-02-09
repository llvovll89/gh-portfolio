import { useEffect, useState } from "react";
import {
    DEFAULT_KEY_COMBINATIONS,
    matchesKeyCombination,
} from "@/constants/keyboardConstants";
import type { KeyCombination } from "@/types/Keyboard.types";
import { KeyboardShortcutId } from "@/types/Keyboard.types";

const STORAGE_KEY = "keyboard_shortcuts_config";

/**
 * 단축키 설정 관리 훅
 * @description 사용자 정의 단축키 설정을 관리하고 localStorage에 저장
 */
export const useKeyboardShortcuts = () => {
    const [shortcuts, setShortcuts] = useState<
        Record<KeyboardShortcutId, KeyCombination>
    >(DEFAULT_KEY_COMBINATIONS);

    // localStorage에서 설정 로드
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setShortcuts({ ...DEFAULT_KEY_COMBINATIONS, ...parsed });
            }
        } catch (error) {
            console.error("Failed to load keyboard shortcuts:", error);
        }
    }, []);

    // 단축키 업데이트
    const updateShortcut = (
        id: KeyboardShortcutId,
        combination: KeyCombination,
    ): { success: boolean; error?: string } => {
        // 충돌 검사
        const conflict = Object.entries(shortcuts).find(
            ([existingId, existingCombo]) =>
                existingId !== id &&
                areKeyCombinationsEqual(existingCombo, combination),
        );

        if (conflict) {
            return {
                success: false,
                error: `이미 ${conflict[0]}에서 사용 중인 단축키입니다.`,
            };
        }

        const newShortcuts = { ...shortcuts, [id]: combination };
        setShortcuts(newShortcuts);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newShortcuts));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: "설정 저장에 실패했습니다.",
            };
        }
    };

    // 단축키 초기화
    const resetShortcut = (id: KeyboardShortcutId) => {
        const newShortcuts = {
            ...shortcuts,
            [id]: DEFAULT_KEY_COMBINATIONS[id],
        };
        setShortcuts(newShortcuts);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newShortcuts));
        } catch (error) {
            console.error("Failed to save shortcuts:", error);
        }
    };

    // 모든 단축키 초기화
    const resetAllShortcuts = () => {
        setShortcuts(DEFAULT_KEY_COMBINATIONS);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Failed to reset shortcuts:", error);
        }
    };

    // 단축키가 사용자 정의되었는지 확인
    const isCustomized = (id: KeyboardShortcutId): boolean => {
        return !areKeyCombinationsEqual(
            shortcuts[id],
            DEFAULT_KEY_COMBINATIONS[id],
        );
    };

    // 특정 단축키 조합이 눌렸는지 확인
    const isShortcutPressed = (
        id: KeyboardShortcutId,
        event: KeyboardEvent,
    ): boolean => {
        return matchesKeyCombination(event, shortcuts[id]);
    };

    return {
        shortcuts,
        updateShortcut,
        resetShortcut,
        resetAllShortcuts,
        isCustomized,
        isShortcutPressed,
    };
};

/**
 * 두 키 조합이 동일한지 비교
 */
const areKeyCombinationsEqual = (
    a: KeyCombination,
    b: KeyCombination,
): boolean => {
    return (
        a.key === b.key &&
        !!a.ctrl === !!b.ctrl &&
        !!a.shift === !!b.shift &&
        !!a.alt === !!b.alt &&
        !!a.meta === !!b.meta
    );
};

/**
 * 키보드 이벤트를 KeyCombination으로 변환
 */
export const eventToKeyCombination = (
    event: KeyboardEvent | React.KeyboardEvent,
): KeyCombination => {
    return {
        key: event.code,
        ctrl: event.ctrlKey || undefined,
        shift: event.shiftKey || undefined,
        alt: event.altKey || undefined,
        meta: event.metaKey || undefined,
    };
};

/**
 * 유효한 단축키인지 검증
 * - 수정자 키(Ctrl, Shift, Alt, Meta) 중 하나는 있어야 함
 * - 특정 키들은 단축키로 사용 불가
 */
export const isValidShortcut = (combination: KeyCombination): boolean => {
    // 수정자 키가 하나도 없으면 유효하지 않음
    if (!combination.ctrl && !combination.shift && !combination.alt && !combination.meta) {
        return false;
    }

    // 단독 수정자 키는 단축키로 사용 불가
    const modifierKeys = [
        "ControlLeft",
        "ControlRight",
        "ShiftLeft",
        "ShiftRight",
        "AltLeft",
        "AltRight",
        "MetaLeft",
        "MetaRight",
    ];
    if (modifierKeys.includes(combination.key)) {
        return false;
    }

    // Tab, Space 등 특정 키는 단축키로 사용 제한
    const restrictedKeys = ["Tab", "Space", "CapsLock"];
    if (restrictedKeys.includes(combination.key)) {
        return false;
    }

    return true;
};
