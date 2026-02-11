import type {ComponentType} from "react";
import {Profile} from "../pages/profile/Profile";
import {Projects} from "../pages/projects/Projects";
import {Contact} from "../pages/contact/Contact";
import {NotFound} from "../pages/notfound/NotFound";
import {Default} from "../pages/default/Default";
import {Blog} from "../pages/blog/Blog";
import {Detail} from "../pages/blog/contents/Detail";
import {Resume} from "../pages/resume/Resume";
import {Uses} from "../pages/uses/Uses";

export const PATHS = {
    DEFAULT: "/",
    PROFILE: "/profile",
    PROJECTS: "/projects",
    CONTACT: "/contact",
    BLOG: "/blog",
    BLOG_DETAIL: "/blog/:slug",
    RESUME: "/resume",
    USES: "/uses",
    NOT_FOUND: "*",
} as const;

export const DEFAULT = PATHS.DEFAULT;
export const PROFILE = PATHS.PROFILE;
export const PROJECTS = PATHS.PROJECTS;
export const CONTACT = PATHS.CONTACT;
export const BLOG = PATHS.BLOG;
export const BLOG_DETAIL = PATHS.BLOG_DETAIL;
export const RESUME = PATHS.RESUME;
export const USES = PATHS.USES;
export const NOT_FOUND = PATHS.NOT_FOUND;

export type RoutePath = (typeof PATHS)[keyof typeof PATHS];

export type AppRoute = {
    path: RoutePath;
    name: string;
    icon?: string;
    component: ComponentType;
};

export const routesPath = [
    {path: PATHS.DEFAULT, name: "Default", icon: "", component: Default},
    {path: PATHS.PROFILE, name: "Profile", icon: "", component: Profile},
    {path: PATHS.PROJECTS, name: "Projects", icon: "", component: Projects},
    {path: PATHS.BLOG, name: "Blog", icon: "", component: Blog},
    {path: PATHS.BLOG_DETAIL, name: "Blog Detail", icon: "", component: Detail},
    {path: PATHS.RESUME, name: "Resume", icon: "", component: Resume},
    {path: PATHS.USES, name: "Uses", icon: "", component: Uses},
    {path: PATHS.CONTACT, name: "Contact", icon: "", component: Contact},
    {path: PATHS.NOT_FOUND, name: "Not Found", icon: "", component: NotFound},
] satisfies ReadonlyArray<AppRoute>;
