import type { Project } from "../mocks/projectData";

/** Real screenshots, framed separately from the full detail image. */
export const ProjectPreview = ({ project, eager = false }: { project: Project; eager?: boolean }) => (
    <div className={`project-preview${project.previewLayout ? ` project-preview-${project.previewLayout}` : ""}`}>
        <img src={project.previewImage ?? project.image} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
    </div>
);
