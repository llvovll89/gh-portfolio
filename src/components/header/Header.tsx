import {Link} from "react-router-dom";
import {routesPath} from "../../routes/route";

export const Header = () => {
    return (
        <header className="w-[calc(100%-300px)] absolute left-75 top-0 h-10 bg-main border-b border-sub-gary px-4 flex items-center">
            <ul className="w-full flex items-center h-full">
                {routesPath.map((r) => (
                    <li
                        key={r.path}
                        className="min-w-30 w-max h-full px-2 text-green-600 border-r border-sub-gary text-[13px] flex items-center cursor-pointer user-select-none"
                    >
                        <Link to={r.path}>
                            <span>✌️</span>
                            <span>{r.name}.tsx</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </header>
    );
};
