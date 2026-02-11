import type {ComponentType} from "react";
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
    PROJECTS: "/projects",
    CONTACT: "/contact",
    BLOG: "/blog",
    BLOG_DETAIL: "/blog/:slug",
    RESUME: "/resume",
    USES: "/uses",
    NOT_FOUND: "*",
} as const;

export const DEFAULT = PATHS.DEFAULT;
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
    {path: PATHS.DEFAULT, name: "default", icon: "", component: Default},
    {path: PATHS.PROJECTS, name: "projects", icon: "", component: Projects},
    {path: PATHS.BLOG, name: "blog", icon: "", component: Blog},
    {path: PATHS.BLOG_DETAIL, name: "blogDetail", icon: "", component: Detail},
    {path: PATHS.RESUME, name: "resume", icon: "", component: Resume},
    {path: PATHS.USES, name: "uses", icon: "", component: Uses},
    {path: PATHS.CONTACT, name: "contact", icon: "", component: Contact},
    {path: PATHS.NOT_FOUND, name: "notFound", icon: "", component: NotFound},
] satisfies ReadonlyArray<AppRoute>;
