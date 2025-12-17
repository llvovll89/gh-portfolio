import {NavType} from "../components/aside/constants/Nav.type";
import type {LayoutState} from "../context/GlobalState.context";

/**
 *
 * @param event 키보드이벤트
 * @param setLayoutState 레이아웃 전역 state
 * @description footer 열고 닫고 하는 이벤트
 */
export const handleToggleFooterUI = (
    event: KeyboardEvent,
    setLayoutState: React.Dispatch<React.SetStateAction<LayoutState>>
) => {
    if (event.ctrlKey && event.code === "Backquote") {
        event.preventDefault();

        setLayoutState((prev) => {
            const isFooterVisible = prev.resizeFooterHeight > 50;
            return {
                ...prev,
                resizeFooterHeight: isFooterVisible ? 50 : 250,
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
    setIsVisibleKeyboardInfo: React.Dispatch<React.SetStateAction<boolean>>
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
    setSelectedNav: React.Dispatch<React.SetStateAction<NavType | null>>
) => {
    if (event.ctrlKey && event.code === "KeyY") {
        event.preventDefault();
        setSelectedNav(NavType.FOLDER);
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
    setSelectedNav: React.Dispatch<React.SetStateAction<NavType | null>>
) => {
    if (event.ctrlKey && event.code === "KeyF") {
        event.preventDefault();
        setSelectedNav(NavType.SEARCH);
    }
};
