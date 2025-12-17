import {NAV_ITEMS, NavType} from "../constants/Nav.type";

interface NavbarProps {
    selectedNav: NavType | null;
    onClickNav: (navType: NavType) => void;
}

export const Navbar = ({selectedNav, onClickNav}: NavbarProps) => {
    return (
        <nav className="w-10 flex flex-col items-center h-screen z-1 border-r border-sub-gary/30 text-white select-none">
            {NAV_ITEMS.map((item) => (
                <button
                    key={item.type}
                    onClick={() => onClickNav(item.type)}
                    className={`cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center ${
                        selectedNav === item.type ? "bg-sub-gary/20" : ""
                    }`}
                >
                    <item.icon className="w-6 h-6" />
                </button>
            ))}
        </nav>
    );
};
