import { NavType } from "@/components/aside/constants/Nav.type";
import type { submitCliCommandType } from "@/context/KeyboardState.context";
import {
    DEFAULT_KEY_COMBINATIONS,
    ESC_DOUBLE_PRESS_TIMEOUT,
    LAYOUT_HEIGHTS,
    matchesKeyCombination,
} from "@/constants/keyboardConstants";
import { KeyboardShortcutId } from "@/types/Keyboard.types";
import type {
    BooleanStateHandler,
    CliCommandHandler,
    LayoutStateHandler,
    MultiStateHandler,
    NavStateHandler,
    TerminalStateHandler,
} from "@/types/Keyboard.types";

/**
 * Footer UI 토글 핸들러
 * @param event 키보드 이벤트
 * @param setLayoutState 레이아웃 전역 state
 * @param setIsTerminalVisible 터미널 표시 상태
 * @description Ctrl + ` 로 터미널을 열고 닫음
 */
export const handleToggleFooterUI: TerminalStateHandler = (
    event,
    setLayoutState,
    setIsTerminalVisible,
) => {
    const combo = DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_FOOTER];

    if (matchesKeyCombination(event, combo)) {
        event.preventDefault();

        setIsTerminalVisible((prev) => {
            const newVisibility = !prev;

            if (newVisibility) {
                // 터미널을 표시하고 열기
                setLayoutState((prevLayout) => ({
                    ...prevLayout,
                    resizeFooterHeight: LAYOUT_HEIGHTS.FOOTER_OPEN,
                }));
            } else {
                // 터미널 숨기기
                setLayoutState((prevLayout) => ({
                    ...prevLayout,
                    resizeFooterHeight: LAYOUT_HEIGHTS.FOOTER_COLLAPSED,
                }));
            }

            return newVisibility;
        });
    }
};

/**
 * 키보드 단축키 정보 모달 토글 핸들러
 * @param event 키보드 이벤트
 * @param setIsVisibleKeyboardInfo 키보드 단축키 정보 모달 전역 state
 * @description Ctrl + F12로 키보드 단축키 정보 모달을 토글함
 */
export const handleCloseKeyboardInfoUI: BooleanStateHandler = (
    event,
    setState,
) => {
    const combo =
        DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_KEYBOARD_INFO];

    if (matchesKeyCombination(event, combo)) {
        event.preventDefault();
        setState((prev) => !prev);
    }
};

/**
 * 폴더 UI 활성화 핸들러
 * @param event 키보드 이벤트
 * @param setSelectedNav navbar에서 선택한 요소 전역 state
 * @description Ctrl + Y로 폴더 UI를 토글함
 */
export const handleActiveFolderUI: NavStateHandler = (event, setSelectedNav) => {
    const combo = DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_FOLDER];

    if (matchesKeyCombination(event, combo)) {
        event.preventDefault();
        setSelectedNav((prev) =>
            prev === NavType.FOLDER ? null : NavType.FOLDER,
        );
    }
};

/**
 * 검색 UI 활성화 핸들러
 * @param event 키보드 이벤트
 * @param setSelectedNav navbar에서 선택한 요소 전역 state
 * @description Ctrl + F로 검색 UI를 토글함 (브라우저 기본 검색 방지)
 */
export const handleActiveSearchUI: NavStateHandler = (event, setSelectedNav) => {
    const combo = DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_SEARCH];

    if (matchesKeyCombination(event, combo)) {
        event.preventDefault(); // 브라우저 기본 찾기(Ctrl+F) 방지
        setSelectedNav((prev) =>
            prev === NavType.SEARCH ? null : NavType.SEARCH,
        );
    }
};

/**
 * CLI 입력 이벤트 핸들러
 * @param event 키보드 이벤트
 * @param setSubmitCliCommand CLI 커맨드 제출 state
 * @description Ctrl + Enter로 CLI 명령을 실행함
 */
export const handleCliEnterEvent: CliCommandHandler = (
    event,
    setSubmitCliCommand,
) => {
    const combo = DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.CLI_ENTER];

    if (matchesKeyCombination(event, combo)) {
        event.preventDefault();
        const target = event.target as HTMLTextAreaElement;

        // textarea 가 아닌 요소(value가 undefined)면 무시 — undefined 세팅으로 콘솔 출력이 지워지는 버그 방지
        if (typeof target.value !== "string") return;

        setSubmitCliCommand((prev) => ({
            ...prev,
            isVisibleCommandUi: true,
            value: target.value,
        }));
    }
};

/**
 * ESC 더블 프레스 핸들러 팩토리
 * 모듈 레벨 변수 대신 클로저를 사용하여 상태 관리
 */
const createEscapeHandler = () => {
    let escPressCount = 0;
    let escTimer: ReturnType<typeof setTimeout> | null = null;

    return (
        event: KeyboardEvent,
        setSubmitCliCommand: React.Dispatch<
            React.SetStateAction<submitCliCommandType>
        >,
        setIsVisibleKeyboardInfo: React.Dispatch<
            React.SetStateAction<boolean>
        >,
    ) => {
        const combo = DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.ALL_CLEAR];

        if (matchesKeyCombination(event, combo)) {
            event.preventDefault();

            escPressCount++;

            if (escTimer) {
                clearTimeout(escTimer);
            }

            if (escPressCount === 2) {
                // 모든 모달 및 입력 창 닫기
                setSubmitCliCommand({ value: "", isVisibleCommandUi: false });
                setIsVisibleKeyboardInfo(false);
                escPressCount = 0;
            } else {
                escTimer = setTimeout(() => {
                    escPressCount = 0;
                }, ESC_DOUBLE_PRESS_TIMEOUT);
            }
        }
    };
};

/**
 * 모든 모달/입력 모드 닫기 핸들러
 * @description ESC를 500ms 내에 2번 눌러야 작동함
 */
export const handleAllClear: MultiStateHandler = createEscapeHandler();

/**
 * 사이드바 토글 핸들러 (새로운 단축키)
 * @param event 키보드 이벤트
 * @param setLayoutState 레이아웃 전역 state
 * @description Ctrl + B로 사이드바를 토글함
 */
export const handleToggleSidebarUI: LayoutStateHandler = (
    event,
    setLayoutState,
) => {
    const combo = DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_SIDEBAR];

    if (matchesKeyCombination(event, combo)) {
        event.preventDefault();

        setLayoutState((prev) => ({
            ...prev,
            // 사이드바 너비 토글 (예: 0 <-> 250)
            resizeSidebarWidth: prev.resizeSidebarWidth > 0 ? 0 : 250,
        }));
    }
};

/**
 * 하단 패널 토글 핸들러 (새로운 단축키)
 * @param event 키보드 이벤트
 * @param setLayoutState 레이아웃 전역 state
 * @param setIsTerminalVisible 터미널 표시 상태
 * @description Ctrl + J로 하단 패널을 토글함 (footer와 유사)
 */
export const handleTogglePanelUI: TerminalStateHandler = (
    event,
    setLayoutState,
    setIsTerminalVisible,
) => {
    const combo = DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_PANEL];

    if (matchesKeyCombination(event, combo)) {
        event.preventDefault();

        setIsTerminalVisible((prev) => {
            const newVisibility = !prev;

            if (newVisibility) {
                // 터미널을 표시하고 열기
                setLayoutState((prevLayout) => ({
                    ...prevLayout,
                    resizeFooterHeight: LAYOUT_HEIGHTS.FOOTER_OPEN,
                }));
            } else {
                // 터미널 숨기기
                setLayoutState((prevLayout) => ({
                    ...prevLayout,
                    resizeFooterHeight: LAYOUT_HEIGHTS.FOOTER_COLLAPSED,
                }));
            }

            return newVisibility;
        });
    }
};

/**
 * 명령 팔레트 토글 핸들러 (새로운 단축키)
 * @param event 키보드 이벤트
 * @param setIsVisibleCommandPalette 명령 팔레트 가시성 state
 * @description Ctrl + Shift + P로 명령 팔레트를 토글함
 */
export const handleToggleCommandPalette: BooleanStateHandler = (
    event,
    setState,
) => {
    const combo =
        DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.COMMAND_PALETTE];

    if (matchesKeyCombination(event, combo)) {
        event.preventDefault();
        setState((prev) => !prev);
    }
};

/**
 * 풀스크린 토글 핸들러
 * @param event 키보드 이벤트
 * @description F11로 전체 화면을 토글함
 */
export const handleToggleFullscreen = (event: KeyboardEvent) => {
    const combo = DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_FULLSCREEN];

    if (matchesKeyCombination(event, combo)) {
        event.preventDefault();

        // window 객체에 있는 toggleFullscreen 함수 호출
        if (typeof (window as any).toggleFullscreen === "function") {
            (window as any).toggleFullscreen();
        }
    }
};
