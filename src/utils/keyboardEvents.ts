import {NavType} from "../components/aside/constants/Nav.type";
import type {LayoutState} from "../context/GlobalState.context";
import type {submitCliCommandType} from "../context/KeyboardState.context";

const COLLAPSED_HEIGHT = 32;
const OPEN_HEIGHT = 220;

/**
 *
 * @param event 키보드이벤트
 * @param setLayoutState 레이아웃 전역 state
 * @description footer 열고 닫고 하는 이벤트
 */
export const handleToggleFooterUI = (
    event: KeyboardEvent,
    setLayoutState: React.Dispatch<React.SetStateAction<LayoutState>>,
) => {
    if (event.ctrlKey && event.code === "Backquote") {
        event.preventDefault();

        setLayoutState((prev) => {
            const isOpen = prev.resizeFooterHeight > COLLAPSED_HEIGHT;
            return {
                ...prev,
                resizeFooterHeight: isOpen ? COLLAPSED_HEIGHT : OPEN_HEIGHT,
            };
        });
    }
};

/**
 *
 * @param event 키보드 이벤트
 * @param setIsVisibleKeyboardInfo 키보드 단축키 정보 모달 전역 state
 * @description 키보드 단축키 정보 모달 토글 이벤트
 */
export const handleCloseKeyboardInfoUI = (
    event: KeyboardEvent,
    setIsVisibleKeyboardInfo: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    if (event.ctrlKey && event.code === "F12") {
        event.preventDefault();
        setIsVisibleKeyboardInfo((prev) => !prev);
    }
};

/**
 *
 * @param event 키보드 이벤트
 * @param setSelectedNav navbar에서 선택한 요소 전역 state
 * @description 폴더 UI 활성화 이벤트
 */
export const handleActiveFolderUI = (
    event: KeyboardEvent,
    setSelectedNav: React.Dispatch<React.SetStateAction<NavType | null>>,
) => {
    if (event.ctrlKey && event.code === "KeyY") {
        event.preventDefault();
        setSelectedNav((prev) =>
            prev === NavType.FOLDER ? null : NavType.FOLDER,
        );
    }
};

/**
 *
 * @param event 키보드 이벤트
 * @param setSelectedNav navbar에서 선택한 요소 전역 state
 * @description 검색 UI 활성화 이벤트
 */
export const handleActiveSearchUI = (
    event: KeyboardEvent,
    setSelectedNav: React.Dispatch<React.SetStateAction<NavType | null>>,
) => {
    if (event.ctrlKey && event.code === "KeyF") {
        event.preventDefault(); // 브라우저 기본 찾기(Ctrl+F) 방지
        setSelectedNav((prev) =>
            prev === NavType.SEARCH ? null : NavType.SEARCH,
        );
    }
};

/**
 *
 * @param event 키보드 이벤트
 * @description CLI 입력창에서 Ctrl + Enter 이벤트
 */
export const handleCliEnterEvent = (
    event: KeyboardEvent,
    setSubmitCliCommand: React.Dispatch<
        React.SetStateAction<submitCliCommandType>
    >,
) => {
    if (event.ctrlKey && event.code === "Enter") {
        event.preventDefault();
        setSubmitCliCommand((prev) => ({
            ...prev,
            isVisibleCommandUi: true,
            value: (event.target as HTMLTextAreaElement).value,
        }));
    }
};

let escPressCount = 0;
let escTimer: ReturnType<typeof setTimeout> | null = null;

/**
 *
 * @param event 키보드 이벤트
 * @description CLI 입력창과 키보드 단축키 정보 모달 모두 닫기 이벤트 (ESC 2번 연속 클릭)
 */
export const handleAllClear = (
    event: KeyboardEvent,
    setSubmitCliCommand: React.Dispatch<
        React.SetStateAction<submitCliCommandType>
    >,
    setIsVisibleKeyboardInfo: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    if (event.code === "Escape") {
        event.preventDefault();

        escPressCount++;

        if (escTimer) {
            clearTimeout(escTimer);
        }

        if (escPressCount === 2) {
            setSubmitCliCommand({value: "", isVisibleCommandUi: false});
            setIsVisibleKeyboardInfo(false);
            escPressCount = 0;
        } else {
            escTimer = setTimeout(() => {
                escPressCount = 0;
            }, 500); // 500ms 내에 2번 눌러야 함
        }
    }
};
