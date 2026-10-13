import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { projects, type Project } from "./mocks/projectData";

export const projectPath = (project: Pick<Project, "slug">) => `/projects/${project.slug}`;

export function useProjects() {
    const { t } = useTranslation();
    return useMemo(() => projects.map(project => {
        const content = t(`projectContent.${project.slug}`, { returnObjects: true });
        return typeof content === "object" ? { ...project, ...content } as Project : project;
    }), [t]);
}
