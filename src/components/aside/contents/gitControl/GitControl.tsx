import {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "../../../../context/GlobalState.context";
import {githubGetRequestParams, octokit} from "../../../../http/api";
import {Link} from "react-router-dom";

export const GitControl = () => {
    const [gitStates, setGitStates] = useState<{
        branch: string[];
        commits: any[];
    }>({branch: [], commits: []});
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

    const {selectedTheme} = useContext(GlobalStateContext);

    const getGitHub = async () => {
        try {
            const responseBranchList = await octokit.request(
                "GET /repos/{owner}/{repo}/branches",
                githubGetRequestParams(),
            );

            const branchList = responseBranchList.data.map(
                (branch) => branch.name,
            );

            setGitStates((prev) => ({
                ...prev,
                branch: branchList,
            }));
        } catch (error) {
            console.error("Error fetching GitHub API:", error);
        }
    };

    const getCommitsByBranch = async () => {
        try {
            const responseCommitList = await octokit.request(
                `GET /repos/{owner}/{repo}/commits?sha=${selectedBranch}`,
                githubGetRequestParams(),
            );

            const commitList = responseCommitList.data.map(
                (commit: any) => commit,
            );

            setGitStates((prev) => ({
                ...prev,
                commits: commitList,
            }));
        } catch (error) {
            console.error("Error fetching commits:", error);
        }
    };

    useEffect(() => {
        (async () => {
            await getGitHub();
        })();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            (async () => {
                await getCommitsByBranch();
            })();
        }
    }, [selectedBranch]);

    return (
        <section
            className={`w-[calc(100%-40px)] flex flex-col ${selectedTheme.mode} overflow-y-auto text-white`}
        >
            <header className="h-10 flex items-center px-3 border-b border-sub-gary/30 text-xs">
                Git Repositories (gh-portfolio)
            </header>
            <ul className="w-full h-[calc(100%-40px)]">
                {gitStates.branch.map((branch) => (
                    <li
                        onClick={() => {
                            setSelectedBranch((prev) =>
                                prev === branch ? null : branch,
                            );
                        }}
                        key={branch}
                        className={`${
                            selectedBranch === branch
                                ? "text-green-500 border-green-500 border-t"
                                : "border-sub-gary/20"
                        } px-3 py-2 text-xs border-b hover:bg-sub-gary/10 cursor-pointer flex flex-col gap-1`}
                    >
                        <div className="w-full flex items-center justify-between">
                            <span>{branch}</span>
                            {gitStates.commits.length > 0 &&
                                selectedBranch === branch && (
                                    <span className="text-[10px]">
                                        commit {gitStates.commits.length}
                                    </span>
                                )}
                        </div>

                        {gitStates.commits.length > 0 &&
                            selectedBranch === branch && (
                                <section
                                    onClick={(e) => e.stopPropagation()}
                                    className={`w-full max-h-100 ${selectedTheme.mode} overflow-auto scrolls select-none scrolls text-white`}
                                >
                                    {gitStates.commits.map((commit) => (
                                        <article
                                            key={commit.sha}
                                            className="w-full py-2 flex flex-col border-b border-sub-gary/20 hover:bg-sub-gary/10 cursor-default gap-[6px] text-[10px]"
                                        >
                                            <div className="w-full flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Link
                                                        to={
                                                            commit.committer
                                                                .html_url
                                                        }
                                                        target="_blank"
                                                        title={`${commit.commit.author.name} 깃허브 프로필 이동`}
                                                    >
                                                        <img
                                                            src={
                                                                commit.committer
                                                                    .avatar_url
                                                            }
                                                            alt="avatar"
                                                            className="w-6 h-6 rounded-[5px] overflow-hidden"
                                                        />
                                                    </Link>
                                                    <span>
                                                        {
                                                            commit.commit.author
                                                                .name
                                                        }
                                                    </span>
                                                </div>
                                                <span>
                                                    {
                                                        new Date(
                                                            commit.commit.author
                                                                .date,
                                                        )
                                                            .toISOString()
                                                            .split("T")[0]
                                                    }
                                                </span>
                                            </div>
                                            <p className="text-[12px] font-bold">
                                                {commit.commit.message}
                                            </p>
                                            <Link
                                                to={commit.html_url}
                                                target="_blank"
                                                className="underline hover:text-primary w-max"
                                            >
                                                Commit 보러가기
                                            </Link>
                                        </article>
                                    ))}
                                </section>
                            )}
                    </li>
                ))}
            </ul>
        </section>
    );
};
