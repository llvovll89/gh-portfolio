import {Main} from "../pages/main/Main";
import {About} from "../pages/about/About";
import {Projects} from "../pages/projects/Projects";
import {Contact} from "../pages/contact/Contact";
import {NotFound} from "../pages/notfound/NotFound";

export const MAIN = "/";
export const ABOUT = "/about";
export const PROJECTS = "/projects";
export const CONTACT = "/contact";
export const NOT_FOUND = "*";

export const routesPath = [
    {path: MAIN, name: "Main", icon: "", component: Main},
    {path: ABOUT, name: "About", icon: "", component: About},
    {path: PROJECTS, name: "Projects", icon: "", component: Projects},
    {path: CONTACT, name: "Contact", icon: "", component: Contact},
    {path: NOT_FOUND, name: "Not Found", icon: "", component: NotFound},
];
