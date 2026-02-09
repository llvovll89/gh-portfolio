# Copilot Instructions (gh-portfolio)

## 프로젝트 개요
- Vite + React(19) + TypeScript 포트폴리오 웹앱. VS Code UI 컨셉(사이드바/터미널/단축키)으로 구성.
- 라우팅은 `react-router-dom` v7의 `<BrowserRouter>` + `<Routes>` 패턴 사용.

## 핵심 구조(큰 그림)
- 앱 엔트리: `src/main.tsx` → `<BrowserRouter>`로 `src/App.tsx` 감쌈.
- 전역 상태:
  - `src/context/GlobalState.context.tsx`: 레이아웃(footer 높이, sidebar 너비), 선택된 네비/경로, 테마 드롭다운 상태.
  - `src/context/KeyboardState.context.tsx`: 단축키 안내/CLI 커맨드 출력(LogViewer) 상태.
- 라우팅 테이블: `src/routes/route.ts`의 `routesPath`를 `App.tsx`에서 순회해 `<Route>` 생성.
- “항상 켜져있는” UX 로직:
  - `src/components/appChildContainer/AppChildContainer.tsx`에서 `useKeyboardEvent()`를 호출(전역 keydown 처리).
  - CLI 출력은 `submitCliCommand.isVisibleCommandUi`일 때 `src/components/LogViewer/LogViewer.tsx`(Portal)로 표시.

## 개발 워크플로우(로컬 실행)
- 개발 서버: `npm run dev` (Vite, 포트 `3001`, `vite.config.ts`)
- 프로덕션 빌드: `npm run build` (`tsc -b` 후 `vite build`)
- 린트: `npm run lint` (ESLint flat config: `eslint.config.js`)
- 프리뷰: `npm run preview`

## 스타일/테마 규칙
- Tailwind CSS v4 사용. 토큰/테마는 `src/global.css`의 `@theme` 변수로 정의.
- 화면 배경 테마는 `ThemeMode`(예: `bg-base-navy`)를 클래스 문자열로 들고 다니며, 컨테이너에 `${selectedTheme.mode}`로 주입하는 패턴을 사용.
  - 예시: `src/components/aside/Aside.tsx`, `src/components/footer/Footer.tsx`, `src/components/aside/contents/gitControl/GitControl.tsx`
- 텍스트/로고 색상은 테마에 따라 `src/utils/convertThemeTextColor.ts` 유틸로 분기.

## 키보드/CLI UX 패턴(중요)
- 전역 단축키는 `src/hooks/useKeyboardEvent.ts` → `src/utils/keyboardEvents.ts`로 위임.
  - 기존 단축키:
    - `Ctrl + \``(푸터 터미널 토글)
    - `Ctrl+F`(검색 토글)
    - `Ctrl+Y`(폴더 토글)
    - `Ctrl+F12`(단축키 안내 토글)
    - `Ctrl+B`(사이드바 토글)
    - `Ctrl+J`(하단 패널 토글)
    - `Ctrl+Shift+P`(명령 팔레트)
    - `ESC` 2회(모두 닫기)
  - 폼 요소(`input`, `select`, `textarea`) 포커스 중에는 기본 단축키를 대부분 막는 규칙(예외: Ctrl 조합).
  - 단축키 시스템:
    - 타입 정의: `src/types/Keyboard.types.ts`
    - 상수 및 유틸: `src/constants/keyboardConstants.ts`
    - 커스터마이징 훅: `src/hooks/useKeyboardShortcuts.ts` (localStorage 저장)
    - 키보드 네비게이션 훅: `src/hooks/useKeyboardNavigation.ts` (포커스 트랩, 화살표 네비게이션)
- 명령 팔레트: `src/components/commandPalette/CommandPalette.tsx`
  - VS Code 스타일 명령 검색 및 실행
  - 키보드 네비게이션 지원 (↑↓, Enter, ESC)
  - 포커스 트랩 적용
- 터미널 입력/출력:
  - 입력 UI: `src/components/footer/cli/Cli.tsx`의 `<textarea>`.
  - 커맨드 파서는 `src/utils/runCliCommand.ts`. 새 명령을 추가할 때는 이 함수의 `switch`에 케이스 추가.
  - `clear`는 "출력 비우기"로 특수 처리(출력 문자열을 `""`로).
- 접근성:
  - 모달/다이얼로그에 포커스 트랩 적용 (`useFocusTrap` 훅 사용)
  - ARIA 속성 사용 (role, aria-modal, aria-label, aria-activedescendant 등)
  - Tab/Shift+Tab 네비게이션 지원
  - 화살표 키 네비게이션 지원 (`useArrowNavigation` 훅)

## 블로그(마크다운) 데이터 흐름
- 소스: `src/content/posts/*.md`
- 로딩: `src/utils/loadPosts.ts`
  - Vite의 `import.meta.glob(..., { eager: true, query: "?raw" })`로 원문 문자열 로딩.
  - slug는 파일명(`.md` 제거) 기반.
- 프론트매터: `src/utils/parseFrontmatter.ts`
  - `---`로 시작하는 매우 단순한 key/value 파서(배열은 `[a, b]` 형태만 지원).
- 렌더링: `src/pages/blog/contents/MarkdownRender.tsx`에서 `react-markdown` + `remark-gfm` 사용.
- 상세 라우트: `/blog/:slug` (`src/routes/route.ts`, `src/pages/blog/contents/Detail.tsx`)

## GitHub 연동(외부 통합)
- Octokit 클라이언트: `src/http/api.ts`
  - 필요 env: `VITE_GIT_HUB_TOKEN`, `VITE_GIT_HUB_APP_ADMIN`, `VITE_GIT_HUB_APP_VERSION`
- Git UI: `src/components/aside/contents/gitControl/GitControl.tsx`
  - 레포/브랜치 목록과 커밋 목록을 `octokit.request()`로 조회.
  - env가 없으면 네트워크 호출이 실패할 수 있으니, UI/에러 로그(콘솔) 처리 방식을 유지.

## 코드 변경 시 주의사항(이 레포 기준)
- 라우트 추가/변경은 `src/routes/route.ts`의 `PATHS` + `routesPath`를 소스 오브 트루스로 유지.
- 전역 단축키 추가는 다음 과정을 따름:
  1. `KeyboardShortcutId` enum에 새 ID 추가 (`src/types/Keyboard.types.ts`)
  2. `DEFAULT_KEY_COMBINATIONS`에 키 조합 추가 (`src/constants/keyboardConstants.ts`)
  3. `SHORTCUT_DESCRIPTIONS_KO/EN`에 설명 추가 (`src/constants/keyboardConstants.ts`)
  4. 핸들러 함수 작성 (`src/utils/keyboardEvents.ts`)
  5. `useKeyboardEvent.ts`에서 핸들러 호출
- 테마 추가는 `ThemeMode` enum(`src/context/constatns/Theme.type.ts`) + `src/global.css`의 토큰/클래스 정의를 함께 업데이트.
- `@` alias는 `vite.config.ts`에서 `src`로 매핑됨(새 파일에서 `@/..` 임포트 가능).
