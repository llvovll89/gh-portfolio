export interface Project {
    id: number;
    title: string;
    image: string;
    scale: string;
    description: string;
    detailedDescription: string;
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
        description:
            "TMDB API를 활용하여 인기있는 영화와 드라마 정보를 제공하는 웹사이트입니다.",
        detailedDescription: `TMDB API를 활용하여 인기있는 영화와 드라마 정보를 제공하는 웹사이트입니다. 
            사용자들은 장르별로 콘텐츠를 탐색하고, 상세 페이지에서 줄거리, 출연진, 예고편 등을 확인할 수 있습니다. 또한, 반응형 디자인을 적용하여 다양한 기기에서 최적의 사용자 경험을 제공합니다.`,
        skills: ["React", "Redux", "TMDB API", "Styled-Components"],
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
        description:
            "사용자들이 자신의 데일리룩 사진을 업로드하고 공유할 수 있는 패션 커뮤니티 플랫폼입니다.",
        detailedDescription:
            "사용자들이 자신의 데일리룩 사진을 업로드하고 공유할 수 있는 플랫폼입니다. 각 사진에는 해시태그를 추가하여 스타일을 분류할 수 있으며, 다른 사용자들의 사진을 탐색하고 좋아요를 누를 수 있습니다. 또한, 인기 있는 스타일과 트렌드를 쉽게 확인할 수 있도록 디자인되었습니다.",
        skills: ["React", "Redux", "Firebase", "Styled-Components"],
        projectMembers: ["김건호"],
    },
    {
        id: 3,
        title: "kimgeonho.dev",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/kimgeonho.png",
        link: {
            repositoryUrl: "https://github.com/llvovll89/gh-portfolio",
            projectUrl: "https://kimgeonho.vercel.app/",
        },
        description:
            "VS Code UI 컨셉을 적용한 인터랙티브 포트폴리오 웹사이트입니다.",
        detailedDescription:
            "VS Code의 UI를 모티브로 제작한 포트폴리오 웹사이트입니다. 사이드바, 터미널, 단축키 등 개발 환경의 친숙한 인터페이스를 활용하여 독특한 사용자 경험을 제공합니다. 프로젝트 소개, 블로그 포스팅, GitHub 연동 기능을 포함하고 있으며, 다양한 테마와 키보드 단축키를 지원합니다.",
        skills: ["React", "TypeScript", "Vite", "Tailwind CSS", "React Router", "Octokit"],
        projectMembers: ["김건호"],
    },
] as Project[];
