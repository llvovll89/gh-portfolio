import type { Project } from "../mocks/projectData";

interface CardHeaderProps {
    project: Project;
    onClose: () => void;
}

export const CardHeader = ({ project, onClose }: CardHeaderProps) => {
    return (
        <div className="w-full flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                        {project.title}
                    </h3>
                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                        {project.scale}
                    </span>
                </div>
                <div className="h-1 w-16 rounded-full bg-linear-to-r from-primary via-fuchsia-400 to-sky-400" />
            </div>

            <button
                onClick={onClose}
                className={[
                    "group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    "border border-slate-200 bg-white text-slate-400",
                    "transition-all duration-200",
                    "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                ].join(" ")}
                aria-label="닫기"
            >
                <svg
                    className="h-4 w-4 transition-transform group-hover:scale-110"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    )
};