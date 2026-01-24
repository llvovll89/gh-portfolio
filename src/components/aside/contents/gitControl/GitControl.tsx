import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalStateContext } from "../../../../context/GlobalState.context";
import { githubGetRequestParams, octokit } from "../../../../http/api";
import { Link } from "react-router-dom";

type RepoName = "gh-portfolio" | "modart" | "blacktie";

type RepoState = {
    branches: string[];
    commits: any[];
};

export const GitControl = () => {
    const repos = useMemo(() => ["gh-portfolio", "modart", "blacktie"] as const, []);

    const [gitStates, setGitStates] = useState<Record<RepoName, RepoState>>({
        "gh-portfolio": { branches: [], commits: [] },
        modart: { branches: [], commits: [] },
        blacktie: { branches: [], commits: [] },
    });

    const [selected, setSelected] = useState<{ repo: RepoName; branch: string } | null>(null);

    const { selectedTheme } = useContext(GlobalStateContext);

    const getBranchesByRepo = async (repo: RepoName) => {
        const response = await octokit.request(
            "GET /repos/{owner}/{repo}/branches",
            githubGetRequestParams(repo),
        );
        return response.data.map((b: any) => b.name as string);
    };

    const getCommitsByRepoBranch = async (repo: RepoName, branch: string) => {
        const response = await octokit.request(
            "GET /repos/{owner}/{repo}/commits",
            {
                ...githubGetRequestParams(repo),
                sha: branch,
            },
        );
        return response.data as any[];
    };

    useEffect(() => {
        (async () => {
            try {
                const results = await Promise.all(
                    repos.map(async (repo) => {
                        const branches = await getBranchesByRepo(repo);
                        return { repo, branches };
                    }),
                );

                setGitStates((prev) => {
                    const next = { ...prev };
                    for (const r of results) {
                        next[r.repo] = { ...next[r.repo], branches: r.branches };
                    }
                    return next;
                });
            } catch (error) {
                console.error("Error fetching GitHub branches:", error);
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

    return (
        <section className={`w-[calc(100%-40px)] flex flex-col ${selectedTheme.mode} overflow-y-auto text-white`}>
            <header className="h-10 flex items-center px-3 border-b border-sub-gary/30 text-xs">
                Git Repositories
            </header>

            <div className="w-full">
                {repos.map((repo) => (
                    <section key={repo} className="border-b border-sub-gary/20">
                        <div className="px-3 py-2 text-xs font-semibold bg-white/5 border-b border-sub-gary/20">
                            {repo}
                        </div>

                        <ul className="w-full">
                            {gitStates[repo].branches.map((branch) => (
                                <li
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
                                    <div className="w-full flex items-center justify-between">
                                        <span>{branch}</span>

                                        {isSelected(repo, branch) && gitStates[repo].commits.length > 0 && (
                                            <span className="text-[10px]">
                                                commit {gitStates[repo].commits.length}
                                            </span>
                                        )}
                                    </div>

                                    {isSelected(repo, branch) && gitStates[repo].commits.length > 0 && (
                                        <section
                                            onClick={(e) => e.stopPropagation()}
                                            className={`w-full max-h-100 ${selectedTheme.mode} overflow-auto scrolls select-none text-white`}
                                        >
                                            {gitStates[repo].commits.map((commit: any) => {
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
                                                        <div className="w-full flex items-center justify-between">
                                                            <div className="flex items-center gap-1">
                                                                {profileUrl && avatarUrl ? (
                                                                    <Link
                                                                        to={profileUrl}
                                                                        target="_blank"
                                                                        title={`${authorName} 깃허브 프로필 이동`}
                                                                    >
                                                                        <img
                                                                            src={avatarUrl}
                                                                            alt="avatar"
                                                                            className="w-6 h-6 rounded-[5px] overflow-hidden"
                                                                        />
                                                                    </Link>
                                                                ) : null}

                                                                <span>{authorName}</span>
                                                            </div>
                                                            <span>{dateStr}</span>
                                                        </div>

                                                        <p className="text-[12px] font-bold">
                                                            {commit?.commit?.message}
                                                        </p>

                                                        <Link
                                                            to={commit.html_url}
                                                            target="_blank"
                                                            className="underline hover:text-primary w-max"
                                                        >
                                                            Commit 보러가기
                                                        </Link>
                                                    </article>
                                                );
                                            })}
                                        </section>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </section>
    );
};