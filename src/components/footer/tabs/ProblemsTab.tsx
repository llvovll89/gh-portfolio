import { useEffect, useState } from "react";
import { LuCircleAlert, LuGitPullRequest } from "react-icons/lu";

const GIT_SUMMARY_UPDATED_EVENT = "portfolio-git-summary-updated";

type ProblemItem = {
    repo: string;
    type: "issue" | "pr";
    number: number;
    title: string;
    url: string;
};

export const ProblemsTab = () => {
    const [items, setItems] = useState<ProblemItem[]>([]);

    useEffect(() => {
        const handleGitSummary = (event: Event) => {
            const customEvent = event as CustomEvent<{ items?: ProblemItem[] }>;
            setItems(customEvent.detail?.items ?? []);
        };
        window.addEventListener(GIT_SUMMARY_UPDATED_EVENT, handleGitSummary);
        return () => window.removeEventListener(GIT_SUMMARY_UPDATED_EVENT, handleGitSummary);
    }, []);

    if (items.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-xs text-white/30 font-mono">
                문제가 없습니다
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto scrolls font-mono text-[11px]">
            {items.map((item) => (
                <a
                    key={`${item.repo}-${item.type}-${item.number}`}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 hover:bg-white/5 transition-colors text-white/70"
                >
                    {item.type === "issue" ? (
                        <LuCircleAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                        <LuGitPullRequest className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                    <span className="text-white/40 shrink-0">{item.repo}</span>
                    <span className="truncate">
                        #{item.number} {item.title}
                    </span>
                </a>
            ))}
        </div>
    );
};
