import { CiKeyboard } from "react-icons/ci";
import { NAV_ITEMS, NavType } from "../constants/Nav.type";
import { useContext } from "react";
import { KeyboardContext } from "../../../context/KeyboardState.context";
import { KeyboardInfo } from "../../keyboardInfo/KeyboardInfo";
import { GlobalStateContext } from "../../../context/GlobalState.context";

interface NavbarProps {
    selectedNav: NavType | null;
    onClickNav: (navType: NavType) => void;
}

export const Navbar = ({ selectedNav, onClickNav }: NavbarProps) => {
    const { toggleKeyboardInfo, isVisibleKeyboardInfo } =
        useContext(KeyboardContext);
    const { selectedTheme } = useContext(GlobalStateContext);

    return (
        <nav className="relative w-10 flex flex-col items-center h-screen z-10 border-r border-sub-gary/30 text-white select-none">
            {NAV_ITEMS.map((item) => (
                <button
                    key={item.type}
                    onClick={() => onClickNav(item.type)}
                    className={`cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center ${selectedNav === item.type ? "bg-sub-gary/20" : ""
                        }`}
                >
                    <item.icon className="w-6 h-6" />
                </button>
            ))}

            <button
                onClick={toggleKeyboardInfo}
                className="focus:outline-none cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center absolute bottom-0 left-0"
            >
                <CiKeyboard className="w-6 h-6" />
            </button>

            {isVisibleKeyboardInfo && <KeyboardInfo />}
        </nav>
    );
};
