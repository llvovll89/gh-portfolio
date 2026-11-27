export interface Project {
    id: number;
    slug: string;
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
    /** 설계·기술 선택과 그 이유 */
    decisions?: string[];
    /** 측정 가능한 결과 (수치 근거) */
    metrics?: string[];
    /** 신호가 약한 프로젝트 — 목록 하단에 배치하고 홈에서 제외 */
    archived?: boolean;
    status?: "updating" | "incomplete";
}

export const projects = [
    {
        id: 8,
        slug: "language-study-room",
        title: "네 언어 공부노트",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/language-study-room.png",
        link: {
            repositoryUrl: "https://github.com/llvovll89/Language-Study-Room",
            projectUrl: "https://language-study-room.vercel.app/",
        },
        description: "한 문장을 한국어·日本語·中文·English로 나란히 익히는, 모든 외국어 문장에 한글 발음을 붙인 공부노트입니다.",
        detailedDescription: "한국어만 아는 학습자를 위해 같은 문장을 일본어·중국어·영어로 나란히 비교하고, 모든 외국어 문장에 한글 발음과 높낮이·속도 표기를 붙인 공부노트입니다. 기본·중급·심화 3단계마다 문법 개념을 먼저 익힌 뒤 단어와 회화로 넘어가며, 여행 탭의 '보여 주기 카드', TOEIC 탭, 자동 생성 문제와 오답 노트, 발음 듣기와 4개 언어 검색을 제공합니다. React Router prerender 웹앱(PWA 오프라인)과 JS 없이도 열리는 단일 HTML 두 결과물이 같은 콘텐츠 원본을 공유합니다.",
        skills: ["React", "TypeScript", "React Router", "Tailwind CSS", "Vite", "PWA", "Playwright", "Vercel"],
        projectMembers: ["김건호"],
        role: "기획, 콘텐츠 설계, 프론트엔드, 테스트, 배포",
        contributions: [
            "데이터 단일 원본을 웹앱과 단일 HTML이 공유하는 구조와 데이터 검증 스크립트",
            "React Router prerender + route loader로 페이지별 데이터만 포함 (JS 번들 202KB → 12KB)",
            "JS 꺼짐·오프라인·모바일 환경을 포함한 Playwright E2E와 서비스 워커 오프라인 지원",
        ],
    },
    {
        id: 7,
        slug: "gh-arcade",
        title: "GH ARCADE",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/variety-gaming-platform.png",
        link: {
            repositoryUrl: "https://github.com/llvovll89/Variety_Gaming_Platform",
            projectUrl: "https://variety-gaming-platform.vercel.app/",
        },
        description: "덱빌딩·3D 격투·퍼즐·전술 RPG부터 아이용 게임까지, 브라우저에서 바로 플레이하는 웹 게임 플랫폼입니다.",
        detailedDescription: "별빛 야간열차(덱빌딩 로그라이크), 밥상 대격돌(3D 격투), 유령 이삿짐센터(3D 퍼즐), 삼국지 패업 PK(육각 턴제 전략) 등 다양한 장르의 게임을 브라우저에서 바로 즐길 수 있는 웹 게임 플랫폼입니다. 쉬는 시간에 맞춰 게임을 골라 주는 '지금 한 판', 매일 바뀌는 '오늘의 도전', 기록·업적을 제공하며, 모든 게임이 공통 키트(스토어·대화상자·플레이 기록 훅)를 공유하도록 설계했습니다.",
        skills: ["React", "TypeScript", "Vite", "Tailwind CSS", "Three.js", "Zod", "Vercel"],
        projectMembers: ["김건호"],
        role: "플랫폼 기획, UI 설계, 게임 개발, 배포",
        contributions: ["시간대별 추천·오늘의 도전·기록과 업적 등 플랫폼 메타 시스템 설계", "덱빌딩·3D 격투·퍼즐·전술 RPG 등 장르별 게임 구현 (Three.js)", "게임 공통 키트(스토어·대화상자·플레이 기록 훅)와 ESLint·CI 도입"],
    },
    {
        id: 1,
        slug: "hovie",
        title: "Hovie",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/hovie.png",
        featuredOrder: 2,
        link: {
            repositoryUrl: "https://github.com/llvovll89/hovie",
            projectUrl: "https://hovie.vercel.app/",
        },
        description:
            "영화·TV 시리즈를 탐색하고, 어디서 보는지 확인하고, 감상 기록과 리뷰를 남기는 개인 영화 플랫폼입니다.",
        detailedDescription:
            "TMDB API 기반으로 트렌딩·개봉 예정·작품 비교와 장르·평점·러닝타임·한국 OTT 조건 탐색, 출연진·예고편·OTT 스트리밍 정보가 담긴 상세 화면을 제공합니다. Firebase로 위시리스트·별점 감상 기록·시즌별 회차 체크·리뷰를 사용자별로 관리하고, 남은 시간과 구독 OTT로 '오늘 볼 작품'을 골라 주며, 저장한 작품을 링크로 공유할 수 있습니다. 다크·라이트 테마와 모바일 하단 탭 내비게이션을 지원합니다.",
        skills: ["React", "TypeScript", "Vite", "Tailwind CSS", "React Router", "TMDB API", "Firebase", "Vercel"],
        projectMembers: ["김건호"],
        featured: true,
        role: "기획, UI 설계, 프론트엔드, Firebase 연동, 배포",
        challenge: "방대한 작품 정보 속에서 '무엇을, 어디서 볼지' 결정하고 감상 기록까지 이어지는 흐름이 필요했습니다.",
        contributions: [
            "통합검색(자동완성·키보드 이동·이전 요청 취소)과 OTT·평점·러닝타임 조건 탐색, 무한 스크롤",
            "Firestore 트랜잭션 기반 위시리스트·감상 기록·회차별 체크와 공유 목록 스냅샷",
            "TV 시리즈를 영화 타입으로 정규화해 카드·상세 컴포넌트 재사용, CSS 변수 기반 다크·라이트 테마",
        ],
        outcome: "탐색부터 시청처 확인, 감상 기록과 공유까지 하나의 반응형 흐름으로 완성했습니다.",
    },
    {
        id: 2,
        slug: "run-river",
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
        description: "GPS로 러닝·하이킹을 기록하고, 인터넷이 끊겨도 오프라인 지도로 이어서 쓸 수 있는 모바일 운동 앱입니다.",
        detailedDescription: "목표 거리·시간을 정하고 GPS로 경로와 페이스를 기록하는 러닝·하이킹 앱입니다. MapLibre GL 기반 공통 지도(OpenFreeMap)와 PMTiles 오프라인 지도 저장으로 신호가 약한 산길에서도 기록을 이어 가며, KMZ 코스 불러오기와 GPX 내보내기를 지원합니다. Next.js PWA와 Capacitor로 iOS·Android 네이티브 앱(백그라운드 GPS, 기기 저장·복구)까지 하나의 코드로 제공합니다.",
        skills: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "MapLibre GL", "PMTiles", "Capacitor", "PWA", "Vercel"],
        projectMembers: ["김건호"],
        featured: true,
        role: "제품 기획, 풀스택 개발, PWA",
        challenge: "신호가 약하거나 끊긴 환경에서도 GPS 기록과 지도가 멈추지 않아야 했습니다.",
        contributions: ["MapLibre 공통 지도와 PMTiles 오프라인 지도 저장", "GPS 기록·기기 저장과 복구, KMZ/GPX 코스 연동", "Capacitor iOS·Android 앱과 PWA 오프라인 대응"],
        outcome: "러닝부터 오프라인 하이킹까지 웹·iOS·Android에서 하나의 코드로 기록하는 경험을 완성했습니다.",
    },
    {
        id: 3,
        slug: "kimgeonho-dev",
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
        decisions: [
            "블로그 글은 빌드 타임에 메타데이터와 본문을 분리해 목록에는 메타만 싣고, 본문은 글에 진입할 때 지연 로드",
            "GitHub 토큰은 Vercel 함수 프록시에만 두고 경로·쿼리를 화이트리스트로 검증해 노출 범위를 최소화",
            "댓글 비밀번호는 서버에서 scrypt 해시로 검증하고, 해시는 클라이언트가 읽을 수 없는 컬렉션에 분리 저장",
        ],
        metrics: [
            "PWA precache 328개 → 45개 파일, 2.1MB → 1.8MB로 축소",
            "블로그 66편 정적 프리렌더 + 글마다 OG 이미지 자동 생성",
            "WCAG 2.2 AA 기준 점검 후 키보드 트랩·대비·라벨 등 20여 개 항목 개선",
            "한국어·영어·일본어 3개 언어 지원",
        ],
    },
    {
        id: 4,
        slug: "meallog",
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
        slug: "wedding-plan",
        archived: true,
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
        slug: "balance-plan",
        title: "잔고플랜",
        scale: "개인 프로젝트",
        image: "/assets/images/projects/잔고플랜.png",
        link: {
            repositoryUrl: "https://github.com/llvovll89/household_account_book",
            projectUrl: "https://balance-plan.vercel.app/",
        },
        description: "수입·지출·예산에 계좌 잔고와 대출·구독까지 한곳에서 관리하는 개인 재무 PWA입니다.",
        detailedDescription: "수입/지출 기록, 카테고리별 예산, 정기 내역 자동 반영, 월별·연간 분석을 제공하는 개인 재무 관리 PWA입니다. 기준일 잔액으로 실제 계좌 잔고를 추적하고, 대출 상환에 따른 남은 원금·완납 예정월과 순자산 추이, 구독(연간·달러 요금 포함), 계좌 간 이체·카드 대금 기록, 납부·예산 알림 센터를 지원합니다. 비로그인 시 기기에 저장하고, 로그인하면 Firebase로 동기화합니다.",
        skills: ["React", "TypeScript", "Vite", "Tailwind CSS", "Firebase", "Recharts", "PWA", "Vercel"],
        projectMembers: ["김건호"],
    },
] as Project[];

export const featuredProjects = projects.filter(project => project.featured)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
