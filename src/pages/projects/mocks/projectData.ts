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
] as Project[];
