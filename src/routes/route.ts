import type {ComponentType} from "react";
import {Main} from "../pages/main/Main";
import {About} from "../pages/about/About";
import {Projects} from "../pages/projects/Projects";
import {Contact} from "../pages/contact/Contact";
import {NotFound} from "../pages/notfound/NotFound";

const MAIN = "/";
const ABOUT = "/about";
const PROJECTS = "/projects";
const CONTACT = "/contact";
const NOT_FOUND = "*";

export const routesPath = [
    {path: MAIN, name: "Main", icon: "", component: Main},
    {path: ABOUT, name: "About", icon: "", component: About},
    {path: PROJECTS, name: "Projects", icon: "", component: Projects},
    {path: CONTACT, name: "Contact", icon: "", component: Contact},
    {path: NOT_FOUND, name: "Not Found", icon: "", component: NotFound},
];
