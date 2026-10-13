import { OptimizedImage } from "../../../components/OptimizedImage";
import type { Project } from "../mocks/projectData";

/** Real screenshots, framed separately from the full detail image. */
export const ProjectPreview = ({ project, eager = false }: { project: Project; eager?: boolean }) => (
    <div className={`project-preview${project.previewLayout ? ` project-preview-${project.previewLayout}` : ""}`}>
        <OptimizedImage src={project.previewImage ?? project.image} alt="" sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 50vw, 520px" fetchPriority={eager ? "high" : undefined} loading={eager ? "eager" : "lazy"} decoding="async" />
    </div>
);
