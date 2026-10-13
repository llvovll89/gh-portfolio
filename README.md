# 🧑‍💻 gh-portfolio

> **VS Code UI 컨셉의 개인 포트폴리오 웹사이트**
> 개발자 김건호의 프로젝트, 기술 스택, 그리고 개발 감성을 담은 공간입니다.

---

## 🌐 Live Demo

🔗 **배포 주소**
👉 [https://kimgeonho.vercel.app/](https://kimgeonho.vercel.app/)

---

## ✨ 주요 특징

- 🧩 **VS Code UI 컨셉**
  실제 VS Code를 사용하는 듯한 레이아웃과 인터랙션

- 📁 **사이드바 네비게이션**
  파일 탐색기, 검색, 북마크, 확장, 설정, Git 컨트롤 패널 포함

- 💻 **터미널(CLI) UI**
  커맨드 입력으로 페이지 이동 및 정보 확인

- 🔍 **커맨드 팔레트**
  단축키로 빠르게 페이지 전환 및 명령 실행

- ⌨️ **키보드 단축키 UX**
  키보드 중심의 개발자 친화적인 경험 제공

- 📝 **블로그**
  마크다운 렌더링, 태그 필터, 검색, 정렬, 그룹 뷰 지원

- 📒 **방명록**
  Firebase 연동으로 실시간 메시지 작성 및 조회

- 📊 **GitHub 활동 대시보드**
  GitHub API(Octokit)를 활용한 기여 히트맵 및 최근 활동 표시

- 🌐 **다국어 지원 (i18n)**
  i18next 기반 한국어 / 영어 / 일본어 전환 및 프로젝트 설명 번역 지원

- 🎨 **테마 색상 지원**
  다크 테마 기반, 유저가 선택하는 커스텀 테마 적용

---

## 🗂 페이지 구성

| 페이지 | 설명 |
| --- | --- |
| `/` | 메인 홈 |
| `/profile` | 소개, 기술 스택, 학력, 이력 |
| `/projects` | 프로젝트 카드 & 기술 스택 필터 |
| `/projects/:slug` | 공유 가능한 프로젝트 상세 페이지 |
| `/blog` | 마크다운 블로그 (검색·태그·정렬) |
| `/resume` | 이력서 |
| `/contact` | 연락처 & 메시지 전송 |
| `/uses` | 사용 도구 & 장비 |

---

## 🛠 기술 스택

| Category | Tech |
| --- | --- |
| Frontend | React 19, TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| Backend | Java, Spring Boot, PostgreSQL, Oracle |
| BaaS | Firebase v12 |
| GitHub API | Octokit v5 |
| i18n | i18next, react-i18next |
| HTTP | Axios |
| Markdown | react-markdown, remark-gfm |
| Icons | react-icons |
| Deploy | Vercel |

---

## 📁 프로젝트 구조

```
src/
├── components/       # 공통 컴포넌트 (Aside, Header, Footer, Modal 등)
│   ├── aside/        # 사이드바 (폴더, 검색, 북마크, Git 컨트롤 등)
│   ├── footer/       # CLI 터미널, 탭 패널
│   ├── commandPalette/
│   ├── ghActivity/   # GitHub 활동 대시보드
│   └── ...
├── pages/            # 페이지별 컴포넌트
│   ├── blog/
│   ├── projects/
│   ├── profile/
│   ├── resume/
│   ├── contact/
│   └── uses/
├── context/          # 전역 상태 (GlobalState, KeyboardState)
├── hooks/            # 커스텀 훅
├── http/             # API 모듈
└── utils/            # 유틸리티 함수
```

## 콘텐츠 로딩

블로그 목록은 빌드 시 생성한 메타데이터만 사용합니다. 본문은 글을 열 때, 전문 검색 데이터는 검색을 시작할 때 불러옵니다. `build/blogContent.ts`가 메타데이터와 검색용 모듈을 생성하며, PWA는 본문과 전문 검색 파일을 사전 다운로드하지 않습니다. 새 글은 기존처럼 `src/content/posts` 또는 `src/content/organizingfiles`에 추가하면 됩니다.

프로젝트 고유 주소는 `projectData.ts`의 `slug`를 사용합니다. 프로젝트 설명 번역은 각 언어 파일의 `projectContent`에서 관리합니다.

## 품질 검증과 최적화

- `npm run verify`: lint, 테스트, 프로덕션 빌드, 검색 노출·이미지·폰트 결과 검증
- `npm run optimize:images`: 원본 PNG에서 WebP와 반응형 크기 변형을 만들고 `src/generated/images.json` 갱신
- `build/seo.ts`: 주요 페이지와 모든 글·프로젝트의 정적 HTML, canonical, JSON-LD, sitemap.xml, robots.txt, RSS, 404.html 생성
- Pretendard Variable은 npm 패키지의 공식 글자 범위별 서브셋을 Vite로 자체 호스팅합니다. 폰트와 글 본문은 PWA가 전체 사전 다운로드하지 않습니다.
- Vercel은 생성된 정적 경로를 제공하고, 알 수 없는 경로는 404로 처리합니다. 새 글과 프로젝트는 빌드 시 자동 반영됩니다.
- 공통 오류 화면은 홈·목록·재시도를 제공하고, 대화상자는 포커스 제한과 복원을 지원합니다. UI 문구는 `uiText` 또는 i18next 키로 한국어·영어·일본어를 지원합니다. 블로그 본문은 원문 언어를 유지합니다.
