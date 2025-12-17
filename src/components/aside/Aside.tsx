import {useContext, useEffect, useRef, useState} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";
import {useDragging} from "../../hooks/useDragging";
import {Navbar} from "./navbar/Navbar";
import {NOT_FOUND, routesPath} from "../../routes/route";
import {NavType} from "./constants/nav.type";
import {Folder} from "./contents/Folder";

export const Aside = () => {
    const [selectedNav, setSelectedNav] = useState<NavType | null>(
        NavType.FOLDER
    );
    const {layoutState, setLayoutState} = useContext(GlobalStateContext);
    const asideRef = useRef<HTMLDivElement>(null);
    const handleMouseDown = useDragging({targetRef: asideRef, type: "sidebar"});

    const handleClickNav = (nav: NavType) => {
        if (selectedNav === nav) {
            setSelectedNav(null);
        } else {
            setSelectedNav(nav);
        }
    };

    useEffect(() => {
        setLayoutState((prev) => ({
            ...prev,
            resizeSidebarWidth: selectedNav ? 300 : 40,
        }));
    }, [selectedNav]);

    return (
        <aside
            ref={asideRef}
            style={{
                width: layoutState.resizeSidebarWidth,
            }}
            className={`translate-x-0 absolute left-0 top-0 h-screen transition-transform ease-in-out bg-main border-r border-sub-gary/30 flex z-1`}
        >
            <Navbar selectedNav={selectedNav} onClickNav={handleClickNav} />

            {selectedNav === NavType.FOLDER && <Folder />}

            {selectedNav && (
                <div
                    style={{
                        width: 8,
                        height: "100vh",
                        cursor: "ew-resize",
                        background: "rgba(0,0,0,0.1)",
                        position: "absolute",
                        top: 0,
                        right: 0,
                        zIndex: 10,
                    }}
                    onMouseDown={handleMouseDown}
                />
            )}
        </aside>
    );
};
