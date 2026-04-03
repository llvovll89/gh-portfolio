# gh-portfolio 프로젝트

## 스택
- React 19 + TypeScript + Vite
- Tailwind CSS v4 (`@import "tailwindcss"` 방식, tailwind.config 없음)
- Firebase (Firestore, Auth)
- react-i18next (다국어: ko/en/ja)
- react-router-dom v7

## 주요 커맨드
```bash
npm run dev      # 개발 서버
npm run build    # tsc -b && vite build
npm run lint     # ESLint
npm run preview  # 빌드 미리보기
```

## 디렉토리 구조
```
src/
  pages/       # 라우트별 페이지 컴포넌트
  components/  # 공용 컴포넌트
  context/     # React Context
  hooks/       # 커스텀 훅
  routes/      # 라우트 상수
  styles/      # 전역 CSS
```

## 컨벤션
- 컴포넌트: named export, PascalCase
- 파일명: PascalCase (컴포넌트), camelCase (훅/유틸)
- Tailwind v4 커스텀 값: `global.css`의 `@theme` 블록에서 관리
- 커스텀 키프레임: `global.css`에 정의 (float, fadeIn, slideInLeft 등)
- 다국어 문자열: `useTranslation()` + i18n 키 사용

## 주의사항
- Prettier 미사용 (ESLint만 존재)
- tailwind.config 없음 — v4 방식
- `min-h-150` 같은 숫자 scale은 v4에서 기본 지원 (×4px)
