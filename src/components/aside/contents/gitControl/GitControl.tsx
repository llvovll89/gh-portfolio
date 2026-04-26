import { useThemeStyle } from "../../../../hooks/useThemeStyle";
import GhActivityDashboard from "../../../ghActivity/GhActivityDashboard";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGitControl } from "./useGitControl";
import { REPOS } from "./gitControlTypes";
import type { TabType } from "./gitControlTypes";

export const GitControl = () => {
    const { t } = useTranslation();
    const { backgroundStyle, backgroundClass } = useThemeStyle();
    const {
        githubUsername,
        gitStates,
        setSelected,
        activeTab,
        setActiveTab,
        selectedRepo,
        showActivity,
        setShowActivity,
        isSelected,
        handleRepoClick,
    } = useGitControl();

    return (
        <section className={`w-full h-full flex flex-col ${backgroundClass} overflow-y-auto scrolls text-white`} style={backgroundStyle}>
            <header className="h-10 flex items-center px-3 border-b border-sub-gary/30 text-xs justify-between">
                <div>{t("gitControl.title")}</div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowActivity((s) => !s)}
                        className="text-[10px] px-3 py-2 rounded bg-white/10 hover:bg-white/10"
                    >
                        Activity
                    </button>
                </div>
            </header>

            <div className="w-full">
                {showActivity && (
                    <div className="px-3 py-2 border-b border-sub-gary/20">
                        <GhActivityDashboard username={githubUsername} />
                    </div>
                )}
                {REPOS.map((repo) => (
                    <section key={repo} className="w-full border-b border-sub-gary/20">
                        <div
                            onClick={() => handleRepoClick(repo)}
                            className="px-3 py-2 bg-white/5 border-b border-sub-gary/20 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold truncate">{repo}</span>
                                <span className="text-[10px] text-white/50 shrink-0">
                                    {selectedRepo === repo ? "▼" : "▶"}
                                </span>
                            </div>

                            {gitStates[repo].stats && (
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-white/70">
                                    <span className="flex items-center gap-1">⭐ {gitStates[repo].stats!.stars}</span>
                                    <span className="flex items-center gap-1">🔀 {gitStates[repo].stats!.forks}</span>
                                    <span className="flex items-center gap-1">👁️ {gitStates[repo].stats!.watchers}</span>
                                    <span className="flex items-center gap-1">⚠️ {gitStates[repo].stats!.openIssues}</span>
                                </div>
                            )}
                        </div>

                        {selectedRepo === repo && (
                            <>
                                <div className="flex border-b border-sub-gary/20 bg-white/5">
                                    {(["branches", "issues", "pullRequests"] as TabType[]).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 px-3 py-2 text-[11px] transition-colors ${
                                                activeTab === tab
                                                    ? "bg-white/10 text-white border-b-2 border-primary"
                                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                            }`}
                                        >
                                            {tab === "branches" && `Branches (${gitStates[repo].branches.length})`}
                                            {tab === "issues" && `Issues (${gitStates[repo].issues.length})`}
                                            {tab === "pullRequests" && `PRs (${gitStates[repo].pullRequests.length})`}
                                        </button>
                                    ))}
                                </div>

                                <div className="max-h-100 overflow-y-auto scrolls">
                                    {activeTab === "branches" && (
                                        <div>
                                            {gitStates[repo].branches.map((branch) => (
                                                <div
                                                    key={`${repo}:${branch}`}
                                                    onClick={() => {
                                                        setSelected((prev) => {
                                                            if (prev?.repo === repo && prev?.branch === branch) return null;
                                                            return { repo, branch };
                                                        });
                                                    }}
                                                    className={`px-3 py-2 text-xs border-b hover:bg-sub-gary/10 cursor-pointer flex flex-col gap-1 ${
                                                        isSelected(repo, branch)
                                                            ? "text-green-500 border-green-500 border-t"
                                                            : "border-sub-gary/20"
                                                    }`}
                                                >
                                                    <div className="w-full flex items-center justify-between gap-2">
                                                        <span className="truncate">{branch}</span>
                                                        {isSelected(repo, branch) && gitStates[repo].commits.length > 0 && (
                                                            <span className="text-[10px] flex-shrink-0">
                                                                {t("gitControl.commits")} {gitStates[repo].commits.length}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {isSelected(repo, branch) && gitStates[repo].commits.length > 0 && (
                                                        <section
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`w-full max-h-100 ${backgroundClass} overflow-auto scrolls select-none text-white mt-2`}
                                                            style={backgroundStyle}
                                                        >
                                                            {gitStates[repo].commits.map((commit) => {
                                                                const authorName =
                                                                    commit?.commit?.author?.name ?? commit?.author?.login ?? "unknown";
                                                                const dateStr = commit?.commit?.author?.date
                                                                    ? new Date(commit.commit.author.date).toISOString().split("T")[0]
                                                                    : "";
                                                                const profileUrl = commit?.committer?.html_url ?? commit?.author?.html_url ?? undefined;
                                                                const avatarUrl = commit?.committer?.avatar_url ?? commit?.author?.avatar_url ?? undefined;

                                                                return (
                                                                    <article
                                                                        key={commit.sha}
                                                                        className="w-full py-2 flex flex-col border-b border-sub-gary/20 hover:bg-sub-gary/10 cursor-default gap-[6px] text-[10px]"
                                                                    >
                                                                        <div className="w-full flex items-center justify-between gap-2">
                                                                            <div className="flex items-center gap-1 min-w-0 flex-1">
                                                                                {profileUrl && avatarUrl ? (
                                                                                    <Link to={profileUrl} target="_blank" title={t("gitControl.viewProfile")} className="flex-shrink-0">
                                                                                        <img src={avatarUrl} alt="avatar" className="w-6 h-6 rounded-[5px] overflow-hidden" />
                                                                                    </Link>
                                                                                ) : null}
                                                                                <span className="truncate">{authorName}</span>
                                                                            </div>
                                                                            <span className="flex-shrink-0">{dateStr}</span>
                                                                        </div>
                                                                        <p className="text-[12px] font-bold line-clamp-2">{commit?.commit?.message}</p>
                                                                        <Link to={commit.html_url} target="_blank" className="underline hover:text-primary w-max">
                                                                            {t("gitControl.viewCommit")}
                                                                        </Link>
                                                                    </article>
                                                                );
                                                            })}
                                                        </section>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === "issues" && (
                                        <div>
                                            {gitStates[repo].issues.length === 0 ? (
                                                <div className="px-3 py-4 text-xs text-white/50 text-center">No issues found</div>
                                            ) : (
                                                gitStates[repo].issues.map((issue) => (
                                                    <Link
                                                        key={issue.id}
                                                        to={issue.html_url}
                                                        target="_blank"
                                                        className="block px-3 py-3 border-b border-sub-gary/20 hover:bg-sub-gary/10 transition-colors"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            {issue.user ? (
                                                                <img src={issue.user.avatar_url} alt={issue.user.login} className="w-6 h-6 rounded-full" />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-sub-gary/30" />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded flex-shrink-0 ${
                                                                        issue.state === "open" ? "bg-green-500/20 text-green-400" : "bg-purple-500/20 text-purple-400"
                                                                    }`}>
                                                                        {issue.state}
                                                                    </span>
                                                                    <span className="text-[10px] text-white/50 flex-shrink-0">#{issue.number}</span>
                                                                </div>
                                                                <p className="text-xs font-medium mb-1 line-clamp-2">{issue.title}</p>
                                                                {issue.labels.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {issue.labels.slice(0, 3).map((label) => (
                                                                            <span
                                                                                key={label.name}
                                                                                className="text-[9px] px-1.5 py-0.5 rounded"
                                                                                style={{ backgroundColor: `#${label.color}40`, color: `#${label.color}` }}
                                                                            >
                                                                                {label.name}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <p className="text-[10px] text-white/50 mt-1">
                                                                    {new Date(issue.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {activeTab === "pullRequests" && (
                                        <div>
                                            {gitStates[repo].pullRequests.length === 0 ? (
                                                <div className="px-3 py-4 text-xs text-white/50 text-center">No pull requests found</div>
                                            ) : (
                                                gitStates[repo].pullRequests.map((pr) => (
                                                    <Link
                                                        key={pr.id}
                                                        to={pr.html_url}
                                                        target="_blank"
                                                        className="block px-3 py-3 border-b border-sub-gary/20 hover:bg-sub-gary/10 transition-colors"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            {pr.user ? (
                                                                <img src={pr.user.avatar_url} alt={pr.user.login} className="w-6 h-6 rounded-full" />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-sub-gary/30" />
                                                            )}
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                                                                        pr.state === "open" ? "bg-green-500/20 text-green-400"
                                                                        : pr.state === "closed" ? "bg-red-500/20 text-red-400"
                                                                        : "bg-purple-500/20 text-purple-400"
                                                                    }`}>
                                                                        {pr.state}
                                                                    </span>
                                                                    {pr.draft && (
                                                                        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">draft</span>
                                                                    )}
                                                                    <span className="text-[10px] text-white/50">#{pr.number}</span>
                                                                </div>
                                                                <p className="text-xs font-medium mb-1">{pr.title}</p>
                                                                <p className="text-[10px] text-white/50">
                                                                    {new Date(pr.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                ))}
            </div>
        </section>
    );
};
