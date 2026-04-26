export type RepoName = "gh-portfolio" | "modart" | "blacktie" | "MealLog" | "wedding-plan";

export type RepoStats = {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
};

export type Issue = {
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

export type PullRequest = {
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

export type Branch = {
    name: string;
};

export type Commit = {
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

export type GitHubIssueResponse = {
    pull_request?: unknown;
    labels: Array<{ name: string; color: string } | unknown>;
} & Omit<Issue, 'labels'>;

export type RepoState = {
    branches: string[];
    commits: Commit[];
    stats: RepoStats | null;
    issues: Issue[];
    pullRequests: PullRequest[];
};

export type TabType = "branches" | "issues" | "pullRequests";

export const REPOS = ["gh-portfolio", "modart", "blacktie", "MealLog", "wedding-plan"] as const;
