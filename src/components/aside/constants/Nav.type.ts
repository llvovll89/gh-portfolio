import {CiFileOn, CiSearch} from "react-icons/ci";
import {VscSourceControl} from "react-icons/vsc";

export enum NavType {
    FOLDER = "folder",
    SEARCH = "search",
    GIT_CONTROL = "git_control",
}

export const NAV_ITEMS: {type: NavType; label: string; icon: any}[] = [
    {
        type: NavType.FOLDER,
        label: "Explorer",
        icon: CiFileOn,
    },
    {
        type: NavType.SEARCH,
        label: "Search",
        icon: CiSearch,
    },
    {
        type: NavType.GIT_CONTROL,
        label: "Git Control",
        icon: VscSourceControl,
    },
];
