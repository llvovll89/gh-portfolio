import {Profile} from "../pages/profile/Profile";
import {Projects} from "../pages/projects/Projects";
import {Contact} from "../pages/contact/Contact";
import {NotFound} from "../pages/notfound/NotFound";
import {Default} from "../pages/default/Default";
import {Blog} from "../pages/blog/Blog";
import {Detail} from "../pages/blog/contents/Detail";

export const DEFAULT = "/";
export const PROFILE = "/profile";
export const PROJECTS = "/projects";
export const CONTACT = "/contact";
export const BLOG = "/blog";
export const BLOG_DETAIL = "/blog/:slug";
export const NOT_FOUND = "*";

export const routesPath = [
    {path: DEFAULT, name: "Default", icon: "", component: Default},
    {path: PROFILE, name: "Profile", icon: "", component: Profile},
    {path: PROJECTS, name: "Projects", icon: "", component: Projects},
    {path: BLOG, name: "Blog", icon: "", component: Blog},
    {path: BLOG_DETAIL, name: "Blog Detail", icon: "", component: Detail},
    {path: CONTACT, name: "Contact", icon: "", component: Contact},
    {path: NOT_FOUND, name: "Not Found", icon: "", component: NotFound},
];
