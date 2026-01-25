import { Profile } from "../pages/profile/Profile";
import { Projects } from "../pages/projects/Projects";
import { Contact } from "../pages/contact/Contact";
import { NotFound } from "../pages/notfound/NotFound";
import { Default } from "../pages/default/Default";
import { Blog } from "../pages/blog/Blog";

export const DEFAULT = "/";
export const PROFILE = "/profile";
export const PROJECTS = "/projects";
export const CONTACT = "/contact";
export const BLOG = "/blog";
export const NOT_FOUND = "*";

export const routesPath = [
    { path: DEFAULT, name: "Default", icon: "", component: Default },
    { path: PROFILE, name: "Profile", icon: "", component: Profile },
    { path: PROJECTS, name: "Projects", icon: "", component: Projects },
    { path: BLOG, name: "Blog", icon: "", component: Blog },
    { path: CONTACT, name: "Contact", icon: "", component: Contact },
    { path: NOT_FOUND, name: "Not Found", icon: "", component: NotFound },
];
