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
  i18next 기반 한국어 / 영어 전환 지원

- 🎨 **테마 색상 지원**
  다크 테마 기반, 유저가 선택하는 커스텀 테마 적용

---

## 🗂 페이지 구성

| 페이지 | 설명 |
| --- | --- |
| `/` | 메인 홈 |
| `/profile` | 소개, 기술 스택, 학력, 이력 |
| `/projects` | 프로젝트 카드 & 상세 모달 |
| `/blog` | 마크다운 블로그 (검색·태그·정렬) |
| `/resume` | 이력서 |
| `/guestbook` | 방명록 (Firebase) |
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
│   ├── guestbook/
│   ├── resume/
│   ├── contact/
│   └── uses/
├── context/          # 전역 상태 (GlobalState, KeyboardState)
├── hooks/            # 커스텀 훅
├── http/             # API 모듈
└── utils/            # 유틸리티 함수
```
