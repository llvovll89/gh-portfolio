export interface Project {
    id: number;
    title: string;
    image: string;
    scale: string;
    description: string;
    link: {
        repositoryUrl: string;
        projectUrl: string;
    };
    skills: string[];
    projectMembers: string[];
}

export const projects = [
    {
        id: 1,
        title: "BlackTie",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/blackTie.png",
        link: {
            repositoryUrl: "https://github.com/llvovll89/blacktie",
            projectUrl: "https://llvovll89.github.io/blacktie/",
        },
        description: "평소 영화와 드라마 보는 것을 좋아해서 저만의 사이트를 만들어보고자 제작하였습니다.",
        skills: ["React", "TypeScript", "Redux", "TMDB API"],
        projectMembers: ["김건호"],
    },
    {
        id: 2,
        title: "ModArt",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/modArt.png",
        link: {
            repositoryUrl: "https://github.com/llvovll89/modart",
            projectUrl: "https://llvovll89.github.io/modart/",
        },
        description: "OOTD (데일리룩) 사진을 공유하는 사이트를 만들고싶어 제작하였습니다.",
        skills: ["React", "TypeScript", "Redux", "Firebase", "Styled-Components"],
        projectMembers: ["김건호"],
    },
] as Project[];
