interface Project {
    id: number;
    title: string;
    image: string;
    link: {
        repositoryUrl: string;
        projectUrl: string;
    };
}

export const projects = [
    {
        id: 1,
        title: "BlackTie",
        image: "/assets/images/projects/blackTie.png",
        link: {
            repositoryUrl: "https://github.com/llvovll89/movieapp",
            projectUrl: "https://llvovll89.github.io/movieapp/",
        },
    },
    {
        id: 2,
        title: "ModArt",
        image: "/assets/images/projects/modArt.png",
        link: {
            repositoryUrl: "https://github.com/llvovll89/modart",
            projectUrl: "https://llvovll89.github.io/modart/",
        },
    },
] as Project[];
