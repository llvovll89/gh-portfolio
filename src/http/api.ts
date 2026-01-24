import { Octokit } from "octokit";

export const GITHUB = "https://api.github.com";
export const octokit = new Octokit({
    auth: import.meta.env.VITE_GIT_HUB_TOKEN,
});

export const githubGetRequestParams = (repo: string) => {
    return {
        owner: import.meta.env.VITE_GIT_HUB_APP_ADMIN,
        repo,
        headers: {
            "X-GitHub-Api-Version": import.meta.env.VITE_GIT_HUB_APP_VERSION,
        },
    };
};