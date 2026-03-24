import { useCallback, useContext, useEffect } from "react";
import { KeyboardContext } from "@/context/KeyboardState.context";
import { LayoutContext } from "@/context/LayoutContext";
import { NavigationContext } from "@/context/NavigationContext";
import { TerminalContext } from "@/context/TerminalContext";

import {
    handleActiveFolderUI,
    handleActiveSearchUI,
    handleActiveGitControlUI,
    handleActiveBookmarksUI,
    handleActiveSettingsUI,
    handleAllClear,
    handleCliEnterEvent,
    handleCloseKeyboardInfoUI,
    handleToggleCommandPalette,
    handleToggleFooterUI,
    handleTogglePanelUI,
    handleToggleSidebarUI,
} from "@/utils/keyboardEvents";
import { RESTRICTED_TAGS } from "@/constants/keyboardConstants";

/**
 * 전역 키보드 이벤트 훅
 * @description window에 keydown 이벤트 리스너를 등록하고 다양한 단축키를 처리
 */
export const useKeyboardEvent = () => {
    const {
        setIsVisibleKeyboardInfo,
        setSubmitCliCommand,
        setIsVisibleCommandPalette,
    } = useContext(KeyboardContext);
    const { setLayoutState } = useContext(LayoutContext);
    const { setSelectedNav } = useContext(NavigationContext);
    const { setIsTerminalVisible } = useContext(TerminalContext);

    /**
     * 키보드 이벤트 핸들러
     * - input, select, textarea에서는 Ctrl 키 없이 동작하지 않음
     */
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            const tag = target.tagName.toLowerCase();

            // 제한된 태그에서는 Ctrl 키가 눌린 경우에만 단축키 허용
            if (
                RESTRICTED_TAGS.includes(
                    tag as (typeof RESTRICTED_TAGS)[number],
                ) &&
                !event.ctrlKey
            ) {
                return;
            }

            // 레이아웃 관련 핸들러
            handleToggleFooterUI(event, setLayoutState, setIsTerminalVisible);
            handleToggleSidebarUI(event, setLayoutState);
            handleTogglePanelUI(event, setLayoutState, setIsTerminalVisible);

            // 네비게이션 관련 핸들러 (매치되면 이후 체크 스킵)
            handleActiveFolderUI(event, setSelectedNav) ||
            handleActiveSearchUI(event, setSelectedNav) ||
            handleActiveGitControlUI(event, setSelectedNav) ||
            handleActiveBookmarksUI(event, setSelectedNav) ||
            handleActiveSettingsUI(event, setSelectedNav);

            // 모달 관련 핸들러
            handleCloseKeyboardInfoUI(event, setIsVisibleKeyboardInfo);
            handleToggleCommandPalette(event, setIsVisibleCommandPalette);

            // CLI 관련 핸들러
            handleCliEnterEvent(event, setSubmitCliCommand);

            // 전체 초기화 핸들러
            handleAllClear(
                event,
                setSubmitCliCommand,
                setIsVisibleKeyboardInfo,
            );
        },
        [
            setLayoutState,
            setSelectedNav,
            setIsVisibleKeyboardInfo,
            setSubmitCliCommand,
            setIsVisibleCommandPalette,
            setIsTerminalVisible,
        ],
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);
};
