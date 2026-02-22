import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalStateContext } from "../../../../context/GlobalState.context";
import { githubGetRequestParams, octokit } from "../../../../http/api";
import GhActivityDashboard from "../../../ghActivity/GhActivityDashboard";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThemeMode } from "../../../../context/constatns/Theme.type";

type RepoName = "gh-portfolio" | "modart" | "blacktie" | "MealLog" | "wedding-plan";

type RepoStats = {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
};

type Issue = {
    id: number;
    number: number;
    title: string;
    state: string;
    created_at: string;
    html_url: string;
    user: {
        login: string;
        avatar_url: string;
        html_url: string;
    } | null;
    labels: { name: string; color: string }[];
};

type PullRequest = {
    id: number;
    number: number;
    title: string;
    state: string;
    created_at: string;
    html_url: string;
    user: {
        login: string;
        avatar_url: string;
        html_url: string;
    } | null;
    draft: boolean;
};

type Branch = {
    name: string;
};

type Commit = {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        };
    };
    author: {
        login: string;
        avatar_url: string;
        html_url: string;
    } | null;
    committer: {
        login: string;
        avatar_url: string;
        html_url: string;
    } | null;
    html_url: string;
};

type GitHubIssueResponse = {
    pull_request?: unknown;
    labels: Array<{ name: string; color: string } | unknown>;
} & Omit<Issue, 'labels'>;

type RepoState = {
    branches: string[];
    commits: Commit[];
    stats: RepoStats | null;
    issues: Issue[];
    pullRequests: PullRequest[];
};

type TabType = "branches" | "issues" | "pullRequests";

export const GitControl = () => {
    const repos = useMemo(() => ["gh-portfolio", "modart", "blacktie", "MealLog", "wedding-plan"] as const, []);
    const { t } = useTranslation();

    const [gitStates, setGitStates] = useState<Record<RepoName, RepoState>>({
        "gh-portfolio": { branches: [], commits: [], stats: null, issues: [], pullRequests: [] },
        modart: { branches: [], commits: [], stats: null, issues: [], pullRequests: [] },
        blacktie: { branches: [], commits: [], stats: null, issues: [], pullRequests: [] },
        MealLog: { branches: [], commits: [], stats: null, issues: [], pullRequests: [] },
        "wedding-plan": { branches: [], commits: [], stats: null, issues: [], pullRequests: [] },
    });

    const [selected, setSelected] = useState<{ repo: RepoName; branch: string } | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("branches");
    const [selectedRepo, setSelectedRepo] = useState<RepoName | null>(null);
    const [showActivity, setShowActivity] = useState(false);

    const githubUsername = import.meta.env.VITE_GITHUB_USERNAME || "llvovll89";

    const { selectedTheme } = useContext(GlobalStateContext);

    // 커스텀 테마 적용
    const backgroundStyle = selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
        ? { backgroundColor: selectedTheme.customColor }
        : {};

    const backgroundClass = selectedTheme.mode === ThemeMode.CUSTOM
        ? ""
        : selectedTheme.mode;

    const getBranchesByRepo = async (repo: RepoName) => {
        const response = await octokit.request(
            "GET /repos/{owner}/{repo}/branches",
            githubGetRequestParams(repo),
        );
        return response.data.map((b: Branch) => b.name);
    };

    const getCommitsByRepoBranch = async (repo: RepoName, branch: string): Promise<Commit[]> => {
        const response = await octokit.request(
            "GET /repos/{owner}/{repo}/commits",
            {
                ...githubGetRequestParams(repo),
                sha: branch,
            },
        );
        return response.data as Commit[];
    };

    const getRepoStats = async (repo: RepoName): Promise<RepoStats> => {
        const response = await octokit.request(
            "GET /repos/{owner}/{repo}",
            githubGetRequestParams(repo),
        );
        return {
            stars: response.data.stargazers_count,
            forks: response.data.forks_count,
            watchers: response.data.watchers_count,
            openIssues: response.data.open_issues_count,
        };
    };

    const getIssuesByRepo = async (repo: RepoName): Promise<Issue[]> => {
        const response = await octokit.request(
            "GET /repos/{owner}/{repo}/issues",
            {
                ...githubGetRequestParams(repo),
                state: "all",
                per_page: 20,
            },
        );
        // PR은 제외 (GitHub API에서 issue에 PR도 포함됨)
        return response.data
            .filter((issue: GitHubIssueResponse) => !issue.pull_request)
            .map((issue: GitHubIssueResponse) => ({
                ...issue,
                labels: issue.labels
                    .filter((label: unknown) => typeof label === 'object' && label !== null && 'name' in label && 'color' in label)
                    .map((label: unknown) => {
                        const labelObj = label as { name?: string; color?: string };
                        return {
                            name: labelObj.name || '',
                            color: labelObj.color || '000000',
                        };
                    }),
            }));
    };

    const getPullRequestsByRepo = async (repo: RepoName): Promise<PullRequest[]> => {
        const response = await octokit.request(
            "GET /repos/{owner}/{repo}/pulls",
            {
                ...githubGetRequestParams(repo),
                state: "all",
                per_page: 20,
            },
        );
        return response.data.map((pr: any) => ({
            ...pr,
            draft: pr.draft ?? false,
        }));
    };

    useEffect(() => {
        (async () => {
            try {
                const results = await Promise.all(
                    repos.map(async (repo) => {
                        const [branches, stats, issues, pullRequests] = await Promise.all([
                            getBranchesByRepo(repo),
                            getRepoStats(repo),
                            getIssuesByRepo(repo),
                            getPullRequestsByRepo(repo),
                        ]);
                        return { repo, branches, stats, issues, pullRequests };
                    }),
                );

                setGitStates((prev) => {
                    const next = { ...prev };
                    for (const r of results) {
                        next[r.repo] = {
                            ...next[r.repo],
                            branches: r.branches,
                            stats: r.stats,
                            issues: r.issues,
                            pullRequests: r.pullRequests,
                        };
                    }
                    return next;
                });
            } catch (error) {
                console.error("Error fetching GitHub data:", error);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selected) return;

        (async () => {
            try {
                // 선택 변경 시 이전 커밋 잠깐 비우기(로딩 느낌)
                setGitStates((prev) => ({
                    ...prev,
                    [selected.repo]: { ...prev[selected.repo], commits: [] },
                }));

                const commits = await getCommitsByRepoBranch(selected.repo, selected.branch);

                setGitStates((prev) => ({
                    ...prev,
                    [selected.repo]: { ...prev[selected.repo], commits },
                }));
            } catch (error) {
                console.error("Error fetching commits:", error);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected?.repo, selected?.branch]);

    const isSelected = (repo: RepoName, branch: string) =>
        selected?.repo === repo && selected?.branch === branch;

    const handleRepoClick = (repo: RepoName) => {
        if (selectedRepo === repo) {
            setSelectedRepo(null);
        } else {
            setSelectedRepo(repo);
            setActiveTab("branches");
        }
    };

    return (
        <section className={`w-full flex flex-col ${backgroundClass} overflow-y-auto text-white`} style={backgroundStyle}>
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
                {repos.map((repo) => (
                    <section key={repo} className="w-full border-b border-sub-gary/20">
                        {/* 레포지토리 헤더 + 통계 */}
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

                            {/* 레포 통계 */}
                            {gitStates[repo].stats && (
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-white/70">
                                    <span className="flex items-center gap-1">
                                        ⭐ {gitStates[repo].stats!.stars}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        🔀 {gitStates[repo].stats!.forks}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        👁️ {gitStates[repo].stats!.watchers}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        ⚠️ {gitStates[repo].stats!.openIssues}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 탭과 콘텐츠 */}
                        {selectedRepo === repo && (
                            <>
                                {/* 탭 헤더 */}
                                <div className="flex border-b border-sub-gary/20 bg-white/5">
                                    <button
                                        onClick={() => setActiveTab("branches")}
                                        className={`flex-1 px-3 py-2 text-[11px] transition-colors ${activeTab === "branches"
                                                ? "bg-white/10 text-white border-b-2 border-primary"
                                                : "text-white/60 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        Branches ({gitStates[repo].branches.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("issues")}
                                        className={`flex-1 px-3 py-2 text-[11px] transition-colors ${activeTab === "issues"
                                                ? "bg-white/10 text-white border-b-2 border-primary"
                                                : "text-white/60 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        Issues ({gitStates[repo].issues.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("pullRequests")}
                                        className={`flex-1 px-3 py-2 text-[11px] transition-colors ${activeTab === "pullRequests"
                                                ? "bg-white/10 text-white border-b-2 border-primary"
                                                : "text-white/60 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        PRs ({gitStates[repo].pullRequests.length})
                                    </button>
                                </div>

                                {/* 탭 콘텐츠 */}
                                <div className="max-h-100 overflow-y-auto scrolls">
                                    {/* Branches 탭 */}
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
                                                    className={`px-3 py-2 text-xs border-b hover:bg-sub-gary/10 cursor-pointer flex flex-col gap-1
                                                        ${isSelected(repo, branch)
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
                                                            {gitStates[repo].commits.map((commit: Commit) => {
                                                                const authorName =
                                                                    commit?.commit?.author?.name ?? commit?.author?.login ?? "unknown";
                                                                const dateStr =
                                                                    commit?.commit?.author?.date
                                                                        ? new Date(commit.commit.author.date).toISOString().split("T")[0]
                                                                        : "";

                                                                const profileUrl =
                                                                    commit?.committer?.html_url ??
                                                                    commit?.author?.html_url ??
                                                                    undefined;

                                                                const avatarUrl =
                                                                    commit?.committer?.avatar_url ??
                                                                    commit?.author?.avatar_url ??
                                                                    undefined;

                                                                return (
                                                                    <article
                                                                        key={commit.sha}
                                                                        className="w-full py-2 flex flex-col border-b border-sub-gary/20 hover:bg-sub-gary/10 cursor-default gap-[6px] text-[10px]"
                                                                    >
                                                                        <div className="w-full flex items-center justify-between gap-2">
                                                                            <div className="flex items-center gap-1 min-w-0 flex-1">
                                                                                {profileUrl && avatarUrl ? (
                                                                                    <Link
                                                                                        to={profileUrl}
                                                                                        target="_blank"
                                                                                        title={t("gitControl.viewProfile")}
                                                                                        className="flex-shrink-0"
                                                                                    >
                                                                                        <img
                                                                                            src={avatarUrl}
                                                                                            alt="avatar"
                                                                                            className="w-6 h-6 rounded-[5px] overflow-hidden"
                                                                                        />
                                                                                    </Link>
                                                                                ) : null}

                                                                                <span className="truncate">{authorName}</span>
                                                                            </div>
                                                                            <span className="flex-shrink-0">{dateStr}</span>
                                                                        </div>

                                                                        <p className="text-[12px] font-bold line-clamp-2">
                                                                            {commit?.commit?.message}
                                                                        </p>

                                                                        <Link
                                                                            to={commit.html_url}
                                                                            target="_blank"
                                                                            className="underline hover:text-primary w-max"
                                                                        >
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

                                    {/* Issues 탭 */}
                                    {activeTab === "issues" && (
                                        <div>
                                            {gitStates[repo].issues.length === 0 ? (
                                                <div className="px-3 py-4 text-xs text-white/50 text-center">
                                                    No issues found
                                                </div>
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
                                                                <img
                                                                    src={issue.user.avatar_url}
                                                                    alt={issue.user.login}
                                                                    className="w-6 h-6 rounded-full"
                                                                />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-sub-gary/30" />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded flex-shrink-0 ${issue.state === "open"
                                                                            ? "bg-green-500/20 text-green-400"
                                                                            : "bg-purple-500/20 text-purple-400"
                                                                        }`}>
                                                                        {issue.state}
                                                                    </span>
                                                                    <span className="text-[10px] text-white/50 flex-shrink-0">
                                                                        #{issue.number}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs font-medium mb-1 line-clamp-2">{issue.title}</p>
                                                                {issue.labels.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {issue.labels.slice(0, 3).map((label) => (
                                                                            <span
                                                                                key={label.name}
                                                                                className="text-[9px] px-1.5 py-0.5 rounded"
                                                                                style={{
                                                                                    backgroundColor: `#${label.color}40`,
                                                                                    color: `#${label.color}`,
                                                                                }}
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

                                    {/* Pull Requests 탭 */}
                                    {activeTab === "pullRequests" && (
                                        <div>
                                            {gitStates[repo].pullRequests.length === 0 ? (
                                                <div className="px-3 py-4 text-xs text-white/50 text-center">
                                                    No pull requests found
                                                </div>
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
                                                                <img
                                                                    src={pr.user.avatar_url}
                                                                    alt={pr.user.login}
                                                                    className="w-6 h-6 rounded-full"
                                                                />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-sub-gary/30" />
                                                            )}
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded ${pr.state === "open"
                                                                            ? "bg-green-500/20 text-green-400"
                                                                            : pr.state === "closed"
                                                                                ? "bg-red-500/20 text-red-400"
                                                                                : "bg-purple-500/20 text-purple-400"
                                                                        }`}>
                                                                        {pr.state}
                                                                    </span>
                                                                    {pr.draft && (
                                                                        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">
                                                                            draft
                                                                        </span>
                                                                    )}
                                                                    <span className="text-[10px] text-white/50">
                                                                        #{pr.number}
                                                                    </span>
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