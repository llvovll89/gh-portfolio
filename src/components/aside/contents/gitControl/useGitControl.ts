import { useEffect, useState } from "react";
import { GITHUB_OWNER, githubFetch } from "../../../../http/api";
import type {
    RepoName,
    RepoStats,
    Issue,
    PullRequest,
    Branch,
    Commit,
    GitHubIssueResponse,
    RepoState,
    TabType,
} from "./gitControlTypes";
import { REPOS } from "./gitControlTypes";

const GIT_SUMMARY_UPDATED_EVENT = "portfolio-git-summary-updated";

const EMPTY_REPO_STATE: RepoState = {
    branches: [],
    commits: [],
    stats: null,
    issues: [],
    pullRequests: [],
};

async function fetchBranches(owner: string, repo: RepoName): Promise<string[]> {
    const data = await githubFetch(`/repos/${owner}/${repo}/branches`) as Branch[];
    return data.map((b) => b.name);
}

async function fetchCommits(owner: string, repo: RepoName, branch: string): Promise<Commit[]> {
    const data = await githubFetch(`/repos/${owner}/${repo}/commits`, { sha: branch });
    return data as Commit[];
}

async function fetchRepoStats(owner: string, repo: RepoName): Promise<RepoStats> {
    const data = await githubFetch(`/repos/${owner}/${repo}`) as {
        stargazers_count: number;
        forks_count: number;
        watchers_count: number;
        open_issues_count: number;
    };
    return {
        stars: data.stargazers_count,
        forks: data.forks_count,
        watchers: data.watchers_count,
        openIssues: data.open_issues_count,
    };
}

async function fetchIssues(owner: string, repo: RepoName): Promise<Issue[]> {
    const data = await githubFetch(`/repos/${owner}/${repo}/issues`, { state: "all", per_page: "20" }) as GitHubIssueResponse[];
    return data
        .filter((issue) => !issue.pull_request)
        .map((issue) => ({
            ...issue,
            labels: issue.labels
                .filter((label): label is { name: string; color: string } =>
                    typeof label === 'object' && label !== null && 'name' in label && 'color' in label
                )
                .map((label) => ({
                    name: (label as { name?: string }).name || '',
                    color: (label as { color?: string }).color || '000000',
                })),
        }));
}

async function fetchPullRequests(owner: string, repo: RepoName): Promise<PullRequest[]> {
    const data = await githubFetch(`/repos/${owner}/${repo}/pulls`, { state: "all", per_page: "20" }) as PullRequest[];
    return data.map((pr) => ({ ...pr, draft: pr.draft ?? false }));
}

export function useGitControl() {
    const githubUsername = (import.meta.env.VITE_GITHUB_USERNAME as string) || "llvovll89";
    const owner = GITHUB_OWNER || githubUsername;

    const [gitStates, setGitStates] = useState<Record<RepoName, RepoState>>(
        Object.fromEntries(REPOS.map((r) => [r, { ...EMPTY_REPO_STATE }])) as Record<RepoName, RepoState>
    );
    const [selected, setSelected] = useState<{ repo: RepoName; branch: string } | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("branches");
    const [selectedRepo, setSelectedRepo] = useState<RepoName | null>(null);
    const [showActivity, setShowActivity] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const results = await Promise.all(
                    REPOS.map(async (repo) => {
                        const [branches, stats, issues, pullRequests] = await Promise.all([
                            fetchBranches(owner, repo),
                            fetchRepoStats(owner, repo),
                            fetchIssues(owner, repo),
                            fetchPullRequests(owner, repo),
                        ]);
                        return { repo, branches, stats, issues, pullRequests };
                    }),
                );

                setGitStates((prev) => {
                    const next = { ...prev };
                    for (const r of results) {
                        next[r.repo] = { ...next[r.repo], branches: r.branches, stats: r.stats, issues: r.issues, pullRequests: r.pullRequests };
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
                setGitStates((prev) => ({
                    ...prev,
                    [selected.repo]: { ...prev[selected.repo], commits: [] },
                }));
                const commits = await fetchCommits(owner, selected.repo, selected.branch);
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

    useEffect(() => {
        const openCount = REPOS.reduce((acc, repo) => {
            const state = gitStates[repo];
            const openIssues = state.issues.filter((issue) => issue.state === "open").length;
            const openPullRequests = state.pullRequests.filter((pr) => pr.state === "open").length;
            return acc + openIssues + openPullRequests;
        }, 0);

        window.dispatchEvent(
            new CustomEvent(GIT_SUMMARY_UPDATED_EVENT, {
                detail: { openCount },
            }),
        );
    }, [gitStates]);

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

    return {
        githubUsername,
        gitStates,
        selected,
        setSelected,
        activeTab,
        setActiveTab,
        selectedRepo,
        showActivity,
        setShowActivity,
        isSelected,
        handleRepoClick,
    };
}
