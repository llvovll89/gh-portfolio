import {useContext, useEffect, useRef} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";
import {useDragging} from "../../hooks/useDragging";
import {Navbar} from "./navbar/Navbar";
import {Folder} from "./contents/folder/Folder";
import {useNavigate} from "react-router-dom";
import {NavType} from "./constants/Nav.type";
import {Search} from "./contents/search/Search";
import {GitControl} from "./contents/gitControl/GitControl";

export const Aside = () => {
    const {
        layoutState,
        setLayoutState,
        selectedPathState,
        selectedNav,
        setSelectedNav,
        selectedTheme,
    } = useContext(GlobalStateContext);
    const asideRef = useRef<HTMLDivElement>(null);
    const handleMouseDown = useDragging({targetRef: asideRef, type: "sidebar"});
    const navigate = useNavigate();

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

    useEffect(() => {
        if (selectedPathState.state) {
            navigate(selectedPathState.state);
        }
    }, [selectedPathState.state]);

    return (
        <aside
            ref={asideRef}
            style={{
                width: layoutState.resizeSidebarWidth,
            }}
            className={`translate-x-0 absolute left-0 top-0 h-screen transition-transform ease-in-out ${selectedTheme.mode} border-r border-sub-gary/30 flex z-1`}
        >
            <Navbar selectedNav={selectedNav} onClickNav={handleClickNav} />

            {selectedNav === NavType.FOLDER && <Folder />}
            {selectedNav === NavType.GIT_CONTROL && <GitControl />}
            {selectedNav === NavType.SEARCH && <Search />}

            {selectedNav && (
                <div
                    style={{
                        width: 8,
                        height: "100vh",
                        cursor: "ew-resize",
                        background: "transparent",
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
