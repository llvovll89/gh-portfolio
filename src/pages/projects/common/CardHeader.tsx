import type { Project } from "../mocks/projectData";

interface CardHeaderProps {
    project: Project;
    onClose: () => void;
}

export const CardHeader = ({ project, onClose }: CardHeaderProps) => {
    return (
        <div className="w-full flex justify-between">
            <h3 className="text-2xl font-bold">{project.title} ({project.scale})</h3>
            <button onClick={onClose} className="cursor-pointer">Close</button>
        </div>
    )
};