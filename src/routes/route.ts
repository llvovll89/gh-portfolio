import {lazy, type ComponentType, type LazyExoticComponent} from "react";

const Default = lazy(() => import("../pages/default/Default").then((m) => ({default: m.Default})));
const Projects = lazy(() => import("../pages/projects/Projects").then((m) => ({default: m.Projects})));
const Blog = lazy(() => import("../pages/blog/Blog").then((m) => ({default: m.Blog})));
const Detail = lazy(() => import("../pages/blog/contents/Detail").then((m) => ({default: m.Detail})));
const Resume = lazy(() => import("../pages/resume/Resume").then((m) => ({default: m.Resume})));
const Uses = lazy(() => import("../pages/uses/Uses").then((m) => ({default: m.Uses})));
const Contact = lazy(() => import("../pages/contact/Contact").then((m) => ({default: m.Contact})));
const Guestbook = lazy(() => import("../pages/guestbook/Guestbook").then((m) => ({ default: m.Guestbook })));
const NotFound = lazy(() => import("../pages/notfound/NotFound").then((m) => ({default: m.NotFound})));

export const PATHS = {
    DEFAULT: "/",
    PROJECTS: "/projects",
    CONTACT: "/contact",
    BLOG: "/blog",
    BLOG_DETAIL: "/blog/:slug",
    GUESTBOOK: "/guestbook",
    RESUME: "/resume",
    USES: "/uses",
    NOT_FOUND: "*",
} as const;

export const DEFAULT = PATHS.DEFAULT;
export const PROJECTS = PATHS.PROJECTS;
export const CONTACT = PATHS.CONTACT;
export const BLOG = PATHS.BLOG;
export const BLOG_DETAIL = PATHS.BLOG_DETAIL;
export const GUESTBOOK = PATHS.GUESTBOOK;
export const RESUME = PATHS.RESUME;
export const USES = PATHS.USES;
export const NOT_FOUND = PATHS.NOT_FOUND;

export type RoutePath = (typeof PATHS)[keyof typeof PATHS];

export type AppRoute = {
    path: RoutePath;
    name: string;
    icon?: string;
    component: ComponentType | LazyExoticComponent<ComponentType>;
};

export const routesPath = [
    {path: PATHS.DEFAULT, name: "default", icon: "", component: Default},
    {path: PATHS.PROJECTS, name: "projects", icon: "", component: Projects},
    {path: PATHS.BLOG, name: "blog", icon: "", component: Blog},
    {path: PATHS.BLOG_DETAIL, name: "blogDetail", icon: "", component: Detail},
    {path: PATHS.RESUME, name: "resume", icon: "", component: Resume},
    {path: PATHS.USES, name: "uses", icon: "", component: Uses},
    {path: PATHS.GUESTBOOK, name: "guestbook", icon: "", component: Guestbook},
    {path: PATHS.CONTACT, name: "contact", icon: "", component: Contact},
    {path: PATHS.NOT_FOUND, name: "notFound", icon: "", component: NotFound},
] satisfies ReadonlyArray<AppRoute>;
