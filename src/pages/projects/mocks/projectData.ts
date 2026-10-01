export interface Project {
    id: number;
    title: string;
    image: string;
    previewImage?: string;
    previewLayout?: "mobile" | "meal";
    featuredOrder?: number;
    scale: string;
    description: string;
    detailedDescription: string;
    link: {
        repositoryUrl: string;
        projectUrl: string;
    };
    skills: string[];
    projectMembers: string[];
    featured?: boolean;
    role?: string;
    challenge?: string;
    contributions?: string[];
    outcome?: string;
    status?: "updating" | "incomplete";
}

export const projects = [
    {
        id: 7,
        title: "GH ARCADE",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/variety-gaming-platform.png",
        link: {
            repositoryUrl: "https://github.com/llvovll89/Variety_Gaming_Platform",
            projectUrl: "https://variety-gaming-platform.vercel.app/",
        },
        description: "전략, 액션, 캐주얼 게임을 한곳에서 탐색하고 바로 플레이하는 웹 게임 플랫폼입니다.",
        detailedDescription: "삼국 영지, 삼국지 패업 PK, 메아리 미로, 슬리더 등 다양한 게임을 브라우저에서 즐길 수 있는 웹 게임 플랫폼입니다. 게임 이름과 태그 검색, 장르별 필터로 원하는 게임을 찾고 바로 실행할 수 있습니다. React와 TypeScript로 플랫폼을 구성하고 Three.js를 활용한 3D 게임을 제공합니다.",
        skills: ["React", "TypeScript", "Vite", "Tailwind CSS", "Three.js", "Zod", "Vercel"],
        projectMembers: ["김건호"],
        role: "플랫폼 기획, UI 설계, 게임 개발, 배포",
        contributions: ["게임 검색과 장르별 탐색 화면 구성", "전략·액션·캐주얼 게임 구현", "Three.js를 활용한 3D 게임 개발"],
    },
    {
        id: 1,
        title: "Hovie",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/hovie.png",
        featuredOrder: 2,
        link: {
            repositoryUrl: "https://github.com/llvovll89/hovie",
            projectUrl: "https://hovie.vercel.app/",
        },
        description:
            "TMDB API를 활용하여 인기있는 영화와 드라마 정보를 제공하는 웹사이트입니다.",
        detailedDescription: `TMDB API를 활용하여 인기있는 영화와 드라마 정보를 제공하는 웹사이트입니다.
            사용자들은 장르별로 콘텐츠를 탐색하고, 상세 페이지에서 줄거리, 출연진, 예고편 등을 확인할 수 있습니다. 또한, 반응형 디자인을 적용하여 다양한 기기에서 최적의 사용자 경험을 제공합니다.`,
        skills: ["React", "Tailwind CSS", "TMDB API", "Firebase", "Vercel"],
        projectMembers: ["김건호"],
        featured: true,
        role: "기획, UI 설계, 프론트엔드, 배포",
        challenge: "많은 영화 정보를 탐색하면서도 상세 정보로 자연스럽게 이어지는 흐름이 필요했습니다.",
        contributions: ["TMDB 데이터 탐색 구조 설계", "장르별 목록과 상세 화면 구현", "반응형 레이아웃 및 배포"],
        outcome: "탐색부터 예고편 확인까지 하나의 반응형 웹 흐름으로 완성했습니다.",
    },
    {
        id: 2,
        title: "Run River",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/run-river.png",
        previewImage: "/assets/images/projects/run-river-mobile.png",
        previewLayout: "mobile",
        featuredOrder: 1,
        link: {
            repositoryUrl: "https://github.com/llvovll89/Run-River",
            projectUrl: "https://run-river.vercel.app/",
        },
        description:
            "카카오 지도 기반으로 러닝 경로를 설정하고 거리·시간·인터벌을 기록할 수 있는 러닝 앱입니다.",
        detailedDescription:
            "카카오 지도와 OSRM 라우팅을 활용하여 러닝·워킹 경로를 설정하고, 거리·시간·인터벌 모드로 운동을 기록하는 웹 애플리케이션입니다. 페이스 구간별 MET 기반 칼로리 계산, 결과 공유 카드, 음성 안내 기능을 제공하며, 주간 챌린지로 꾸준한 운동 습관을 지원합니다. PWA를 지원하여 모바일에서도 앱처럼 사용할 수 있습니다.",
        skills: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Kakao Maps API", "OSRM", "PWA", "Vercel"],
        projectMembers: ["김건호"],
        featured: true,
        role: "제품 기획, 풀스택 개발, PWA",
        challenge: "지도 위 경로 설정과 운동 기록을 모바일 환경에서도 끊김 없이 연결해야 했습니다.",
        contributions: ["Kakao Maps와 OSRM 경로 계산 연동", "페이스와 MET 기반 기록 기능 구현", "음성 안내와 공유 카드, PWA 지원"],
        outcome: "경로 계획, 기록, 결과 공유를 하나의 모바일 중심 러닝 경험으로 통합했습니다.",
    },
    {
        id: 3,
        title: "kimgeonho.dev",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/kimgeonho.png",
        featuredOrder: 3,
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
        featured: true,
        role: "UX 설계, 프론트엔드, 콘텐츠 운영",
        challenge: "VS Code 콘셉트를 유지하면서 비개발자도 핵심 정보를 쉽게 찾을 수 있어야 했습니다.",
        contributions: ["탭과 사이드바 기반 정보 구조 구현", "테마와 키보드 단축키 지원", "프로젝트와 기술 블로그 통합"],
        outcome: "개발 도구의 개성을 포트폴리오 탐색 경험으로 확장했습니다.",
    },
    {
        id: 4,
        title: "MealLog",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/meallog.png",
        previewLayout: "meal",
        link: {
            repositoryUrl: "https://github.com/llvovll89/MealLog",
            projectUrl: "https://meallog-dev.vercel.app/",
        },
        description:
            "식단 기록과 건강 관리를 결합한 스마트 식단 관리 웹 애플리케이션입니다.",
        detailedDescription:
            "시간대별 메뉴 추천, 식사 기록 및 칼로리 추적, 체중 변화 모니터링, 영양 패턴 분석 기능을 제공하는 식단 관리 애플리케이션입니다. 87가지 메뉴 데이터베이스를 활용한 중복 방지 알고리즘으로 다양한 추천을 제공하며, BMI 계산기와 사진 업로드 기능을 포함합니다. 파스텔톤의 세련된 디자인과 슬롯머신 애니메이션 UI로 재미있는 사용자 경험을 제공합니다. PWA를 지원하여 모바일 앱처럼 사용할 수 있으며, LocalStorage 기반으로 개인정보 걱정 없이 데이터를 관리합니다.",
        skills: ["React", "TypeScript", "Vite", "Tailwind CSS", "PWA"],
        projectMembers: ["김건호"],
    },
    {
        id: 5,
        title: "Wedding Plan",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/weddingPlan.png",
        link: {
            repositoryUrl: "https://github.com/llvovll89/wedding-plan",
            projectUrl: "https://wedding-plan-gh.vercel.app/",
        },
        description:
            "결혼식 준비를 돕는 웨딩 플랜 웹 애플리케이션입니다.",
        detailedDescription:
            "결혼식 준비를 체계적으로 관리할 수 있도록 돕는 웨딩 플랜 웹 애플리케이션입니다. 웨딩 일정 관리, 예산 계획, 체크리스트 등 다양한 기능을 제공하며, Firebase를 활용한 실시간 데이터 동기화와 인증 기능을 지원합니다.",
        skills: ["React", "TypeScript", "Vite", "Tailwind CSS", "Firebase", "Vercel"],
        projectMembers: ["김건호"],
    },
    {
        id: 6,
        title: "잔고플랜",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/잔고플랜.png",
        link: {
            repositoryUrl: "https://github.com/llvovll89/household_account_book",
            projectUrl: "https://balance-plan.vercel.app/",
        },
        description:
            "수입과 지출을 기록하고 월별 흐름을 확인할 수 있는 가계부 웹 애플리케이션입니다.",
        detailedDescription:
            "가계부 작성에 필요한 수입/지출 기록, 카테고리 관리, 월별 지출 흐름 확인 기능을 제공하는 프로젝트입니다. 일상적인 소비 패턴을 직관적으로 파악할 수 있도록 구성하여, 예산 관리와 지출 습관 개선에 도움을 줍니다.",
        skills: ["React", "TypeScript", "Vite", "Tailwind CSS", "Firebase", "Vercel", "PWA"],
        projectMembers: ["김건호"],
    },
] as Project[];

export const featuredProjects = projects.filter(project => project.featured)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
