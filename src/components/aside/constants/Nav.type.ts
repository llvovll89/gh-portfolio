import { CiFileOn, CiSearch } from "react-icons/ci";
import { VscSourceControl, VscBookmark, VscSettingsGear } from "react-icons/vsc";

export enum NavType {
    FOLDER = "folder",
    SEARCH = "search",
    GIT_CONTROL = "git_control",
    BOOKMARKS = "bookmarks",
    SETTINGS = "settings",
}

export const NAV_ITEMS: { type: NavType; label: string; labelKey: string; icon: any }[] = [
    {
        type: NavType.FOLDER,
        label: "Explorer",
        labelKey: "nav.explorer",
        icon: CiFileOn,
    },
    {
        type: NavType.SEARCH,
        label: "Search",
        labelKey: "nav.search",
        icon: CiSearch,
    },
    {
        type: NavType.GIT_CONTROL,
        label: "Git Control",
        labelKey: "nav.gitControl",
        icon: VscSourceControl,
    },
    {
        type: NavType.BOOKMARKS,
        label: "Bookmarks",
        labelKey: "nav.bookmarks",
        icon: VscBookmark,
    },
    {
        type: NavType.SETTINGS,
        label: "Settings",
        labelKey: "nav.settings",
        icon: VscSettingsGear,
    },
];
