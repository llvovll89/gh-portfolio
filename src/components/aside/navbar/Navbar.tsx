import { CiKeyboard } from "react-icons/ci";
import { VscGithub, VscTerminal } from "react-icons/vsc";
import { SiVelog } from "react-icons/si";
import { NAV_ITEMS, NavType } from "../constants/Nav.type";
import { useContext } from "react";
import { KeyboardContext } from "../../../context/KeyboardState.context";
import { GlobalStateContext } from "../../../context/GlobalState.context";
import { KeyboardInfo } from "../../keyboardInfo/KeyboardInfo";

interface NavbarProps {
    selectedNav: NavType | null;
    onClickNav: (navType: NavType) => void;
}

export const Navbar = ({ selectedNav, onClickNav }: NavbarProps) => {
    const { toggleKeyboardInfo, isVisibleKeyboardInfo } =
        useContext(KeyboardContext);
    const { isTerminalVisible, setIsTerminalVisible, setLayoutState } = useContext(GlobalStateContext);

    const COLLAPSED_HEIGHT = 32; // 터미널 헤더 바 높이
    const OPEN_HEIGHT = 220; // 터미널 열렸을 때 최소 높이

    const toggleTerminal = () => {
        if (!isTerminalVisible) {
            // 터미널이 숨겨져 있으면 표시하고 열기
            setIsTerminalVisible(true);
            setLayoutState((prev) => ({
                ...prev,
                resizeFooterHeight: OPEN_HEIGHT,
            }));
        } else {
            // 터미널이 표시되어 있으면 숨기기
            setIsTerminalVisible(false);
            setLayoutState((prev) => ({
                ...prev,
                resizeFooterHeight: COLLAPSED_HEIGHT,
            }));
        }
    };

    return (
        <nav className="relative w-10 flex flex-col items-center h-screen z-10 border-r border-sub-gary/30 text-white select-none">
            {/* Main navigation items */}
            <div className="flex-1 flex flex-col w-full">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.type}
                        onClick={() => onClickNav(item.type)}
                        className={`cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center transition-colors ${
                            selectedNav === item.type
                                ? "bg-sub-gary/20 text-primary"
                                : "text-white hover:bg-sub-gary/10"
                        }`}
                        aria-label={item.label}
                    >
                        <item.icon className="w-5 h-5" />
                    </button>
                ))}
            </div>

            {/* Bottom section with social links and utilities */}
            <div className="flex flex-col w-full">
                {/* Terminal toggle button */}
                <button
                    onClick={toggleTerminal}
                    className="cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center text-white hover:bg-sub-gary/10 transition-colors"
                    aria-label="터미널 토글"
                    title="터미널 열기/닫기"
                >
                    <VscTerminal className="w-5 h-5" />
                </button>

                {/* GitHub link */}
                <a
                    href="https://github.com/llvovll89"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center text-white hover:bg-sub-gary/10 transition-colors"
                    aria-label="GitHub 프로필"
                    title="GitHub"
                >
                    <VscGithub className="w-5 h-5" />
                </a>

                {/* Velog link */}
                <a
                    href="https://velog.io/@llvovll89/posts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center text-white hover:bg-sub-gary/10 transition-colors"
                    aria-label="Velog 블로그"
                    title="Velog"
                >
                    <SiVelog className="w-4 h-4" />
                </a>

                {/* Keyboard shortcuts button */}
                <button
                    onClick={toggleKeyboardInfo}
                    className="focus:outline-none cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center text-white hover:bg-sub-gary/10 transition-colors"
                    aria-label="키보드 단축키 안내"
                    title="키보드 단축키"
                >
                    <CiKeyboard className="w-6 h-6" />
                </button>
            </div>

            {isVisibleKeyboardInfo && <KeyboardInfo />}
        </nav>
    );
};
