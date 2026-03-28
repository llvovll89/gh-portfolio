---
title: Tailwind CSS v4 완벽 가이드: CSS-First 설정과 새로운 기능 총정리
date: 2026-03-28
summary: Tailwind CSS v4에서 도입된 CSS-first 설정, 새로운 엔진(Oxide), 동적 유틸리티, 컨테이너 쿼리 등 핵심 변경사항을 실전 예제와 함께 정리합니다. v3에서 v4로 마이그레이션하는 방법도 다룹니다.
tags: [TailwindCSS, CSS, Frontend, Styling, v4]
---

Tailwind CSS v4는 단순한 마이너 업데이트가 아닙니다. 설정 방식이 `tailwind.config.js`에서 CSS 파일로 완전히 이동했고, 새 엔진(Oxide)으로 빌드 속도가 최대 10배 빨라졌습니다. 기존 v3 사용자라면 반드시 변경사항을 확인하고 마이그레이션 전략을 세워야 합니다.

> 목표: Tailwind CSS v4의 핵심 변경사항을 파악하고, 새 설정 방식과 신규 유틸리티를 실무에 즉시 활용할 수 있다.

## 목차

1. [v4의 핵심 변화 요약](#1-v4의-핵심-변화-요약)
2. [설치 및 설정 — CSS-first 방식](#2-설치-및-설정--css-first-방식)
3. [테마 커스터마이징 (@theme)](#3-테마-커스터마이징-theme)
4. [동적 유틸리티와 임의값](#4-동적-유틸리티와-임의값)
5. [컨테이너 쿼리 (@container)](#5-컨테이너-쿼리-container)
6. [새로운 유틸리티들](#6-새로운-유틸리티들)
7. [다크 모드와 변형(Variant) 개선](#7-다크-모드와-변형variant-개선)
8. [Vite 플러그인 통합](#8-vite-플러그인-통합)
9. [v3 → v4 마이그레이션 가이드](#9-v3--v4-마이그레이션-가이드)
10. [실전 컴포넌트 예제](#10-실전-컴포넌트-예제)

---

## 1. v4의 핵심 변화 요약

| 항목 | v3 | v4 |
|------|----|----|
| **설정 방식** | `tailwind.config.js` | CSS `@theme` 블록 |
| **콘텐츠 스캔** | `content` 배열 수동 지정 | 자동 감지 |
| **엔진** | PostCSS (JavaScript) | Oxide (Rust) |
| **빌드 속도** | 기준 | 최대 10배 빠름 |
| **설치** | `tailwindcss` + `postcss` | `@tailwindcss/vite` 또는 CLI |
| **CSS 변수** | 수동 설정 | 자동으로 CSS 변수 생성 |
| **컨테이너 쿼리** | 플러그인 필요 | 내장 지원 |
| **3D Transform** | 미지원 | 내장 지원 |

---

## 2. 설치 및 설정 — CSS-first 방식

### Vite 프로젝트 설치

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

### CSS 파일에서 임포트

```css
/* src/index.css */
@import "tailwindcss";
```

끝입니다. `tailwind.config.js`도 `content` 배열도 필요 없습니다. v4는 프로젝트 파일을 자동으로 스캔합니다.

### Next.js 설치

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

```js
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

```css
/* app/globals.css */
@import "tailwindcss";
```

---

## 3. 테마 커스터마이징 (@theme)

v4에서는 `tailwind.config.js` 대신 CSS의 `@theme` 블록에서 모든 테마를 정의합니다.

### v3 방식 (구식)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
};
```

### v4 방식 (CSS @theme)

```css
@import "tailwindcss";

@theme {
  /* 색상 — CSS 변수로 자동 노출 */
  --color-brand-50: #eff6ff;
  --color-brand-500: #3b82f6;
  --color-brand-900: #1e3a8a;

  /* 폰트 */
  --font-sans: 'Pretendard', sans-serif;

  /* 간격 */
  --spacing-18: 4.5rem;

  /* 브레이크포인트 */
  --breakpoint-xs: 480px;
  --breakpoint-3xl: 1920px;

  /* 애니메이션 */
  --animate-spin-slow: spin 3s linear infinite;
}
```

이렇게 정의하면 `bg-brand-500`, `font-sans`, `p-18`, `xs:flex` 같은 클래스가 자동으로 생성됩니다. 또한 CSS 변수(`var(--color-brand-500)`)로도 직접 사용할 수 있습니다.

---

## 4. 동적 유틸리티와 임의값

v4는 **모든 유틸리티를 동적으로 생성**합니다. v3에서 사전 정의된 스케일을 벗어나려면 임의값(`[]`)을 써야 했지만, v4에서는 테마 변수에 없는 값도 자동으로 생성됩니다.

```html
<!-- v3: 임의값만 가능했던 경우 -->
<div class="mt-[13px] w-[327px]">

<!-- v4: 스케일 외 값도 유틸리티로 직접 사용 가능 -->
<div class="mt-13 w-327">
```

### CSS 변수를 유틸리티에서 직접 참조

```html
<!-- CSS 변수를 임의값으로 참조 -->
<div class="bg-[--color-brand-500]">
<div class="text-[--font-size-hero]">
```

---

## 5. 컨테이너 쿼리 (@container)

v4에서는 별도 플러그인 없이 컨테이너 쿼리를 사용할 수 있습니다.

```html
<!-- 컨테이너 정의 -->
<div class="@container">
  <!-- 컨테이너 너비에 따라 반응 -->
  <div class="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3">
    <div class="@sm:flex @sm:gap-4">
      <img class="w-full @sm:w-24" src="..." />
      <div>
        <h3 class="text-sm @lg:text-base">제목</h3>
        <p class="hidden @sm:block">설명</p>
      </div>
    </div>
  </div>
</div>
```

### 네임드 컨테이너

```html
<div class="@container/sidebar">
  <nav class="@lg/sidebar:block hidden">사이드바</nav>
</div>

<div class="@container/main">
  <article class="@xl/main:prose-lg">본문</article>
</div>
```

### 커스텀 컨테이너 사이즈

```css
@theme {
  --container-2xs: 16rem;
  --container-8xl: 96rem;
}
```

```html
<div class="@2xs:flex @8xl:grid">...</div>
```

---

## 6. 새로운 유틸리티들

### 3D Transform

```html
<!-- 원근감 설정 -->
<div class="perspective-500">
  <!-- 3D 회전 -->
  <div class="rotate-x-45 rotate-y-12 rotate-z-6">
    카드
  </div>
</div>

<!-- backface 제어 -->
<div class="backface-hidden transform-3d">
  ...
</div>
```

### field-sizing — 텍스트에어리어 자동 크기 조절

```html
<!-- 내용에 따라 자동으로 높이 조절 -->
<textarea class="field-sizing-content resize-none">
  입력하면 자동으로 늘어납니다
</textarea>
```

### color-mix() 기반 opacity 수정자

```html
<!-- 배경에 투명도 적용 (v4 방식) -->
<div class="bg-blue-500/50">50% 투명도</div>

<!-- 텍스트 색상에 투명도 -->
<p class="text-brand-500/75">브랜드 색상 75% 불투명</p>
```

### inset-shadow (inner shadow)

```html
<div class="inset-shadow-sm inset-shadow-black/20">
  안쪽 그림자
</div>
```

### text-shadow

```html
<h1 class="text-shadow-lg text-shadow-black/30">
  텍스트 그림자
</h1>
```

### mask-* 유틸리티

```html
<div class="mask-gradient-to-b">
  아래로 페이드아웃되는 콘텐츠
</div>
```

---

## 7. 다크 모드와 변형(Variant) 개선

### 다크 모드 설정

```css
@import "tailwindcss";

@variant dark (&:where(.dark, .dark *));
```

또는 미디어 쿼리 기반:

```css
/* 기본값 — prefers-color-scheme 사용 */
@import "tailwindcss";
```

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  다크 모드 지원
</div>
```

### 커스텀 변형(Variant) 정의

```css
@import "tailwindcss";

/* 커스텀 변형 정의 */
@variant hocus (&:hover, &:focus);
@variant not-disabled (&:not(:disabled));
@variant scrolled (&.is-scrolled);
```

```html
<button class="hocus:bg-blue-600 not-disabled:cursor-pointer">
  버튼
</button>

<header class="bg-transparent scrolled:bg-white scrolled:shadow-md">
  헤더
</header>
```

### 중첩 변형 (Stacked Variants)

```html
<!-- 다크 모드 + hover 조합 -->
<button class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">

<!-- 컨테이너 + 반응형 조합 -->
<div class="@container">
  <p class="text-sm @lg:text-base md:@lg:text-lg">
    반응형 + 컨테이너 쿼리 동시 적용
  </p>
</div>
```

---

## 8. Vite 플러그인 통합

v4의 Vite 플러그인은 PostCSS 없이도 동작하며, HMR 성능이 크게 향상됩니다.

```ts
// vite.config.ts (React + TypeScript)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // PostCSS 불필요
  ],
});
```

### CSS 레이어 활용

```css
@import "tailwindcss";

/* 커스텀 스타일을 Tailwind 레이어에 추가 */
@layer base {
  h1 { @apply text-3xl font-bold; }
  a { @apply text-brand-500 hover:underline; }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  .btn-primary {
    @apply btn bg-brand-500 text-white hover:bg-brand-600;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

---

## 9. v3 → v4 마이그레이션 가이드

### 자동 마이그레이션 도구

```bash
npx @tailwindcss/upgrade
```

이 명령어가 대부분의 변환을 자동으로 처리합니다.

### 주요 변경사항 대조표

| v3 | v4 | 비고 |
|----|----|----|
| `tailwind.config.js` | `@theme` in CSS | 설정 방식 변경 |
| `content: [...]` | 자동 감지 | 제거 가능 |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | 단일 임포트 |
| `theme.extend.colors` | `@theme { --color-* }` | CSS 변수 방식 |
| `theme.screens` | `@theme { --breakpoint-* }` | 네이밍 변경 |
| `opacity-50` (별도 속성) | `bg-blue-500/50` | 수정자 방식으로 통일 |
| `ring-offset-*` | 제거 | `outline-offset-` 사용 |

### 수동으로 확인해야 할 항목

```css
/* v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 */
@import "tailwindcss";
```

```js
// v3 config — v4에서 CSS로 이동
module.exports = {
  theme: {
    extend: {
      colors: { primary: '#FF6B6B' }, // → @theme { --color-primary: #FF6B6B; }
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'), // → v4 내장
    require('@tailwindcss/typography'),        // → 여전히 플러그인 사용
  ],
};
```

---

## 10. 실전 컴포넌트 예제

### 반응형 카드 그리드 (컨테이너 쿼리 활용)

```tsx
function ProductGrid({ products }) {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="@container/card group">
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow">
              <img
                src={product.image}
                className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4 @sm/card:p-6">
                <h3 className="font-bold text-gray-900 dark:text-white @sm/card:text-lg">
                  {product.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm @sm/card:text-base mt-1">
                  {product.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-brand-500 font-bold text-xl">
                    ₩{product.price.toLocaleString()}
                  </span>
                  <button className="btn-primary text-sm @sm/card:text-base">
                    장바구니
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 다크 모드 토글 네비게이션

```tsx
function Navbar() {
  return (
    <header className="
      fixed top-0 w-full z-50
      bg-white/80 dark:bg-gray-900/80
      backdrop-blur-md
      border-b border-gray-200 dark:border-gray-700
      transition-colors duration-300
    ">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="font-bold text-xl text-brand-500">
          로고
        </a>

        <ul className="hidden md:flex gap-8">
          {['홈', '블로그', '포트폴리오', '연락처'].map(item => (
            <li key={item}>
              <a className="
                text-gray-600 dark:text-gray-300
                hocus:text-brand-500 dark:hocus:text-brand-400
                transition-colors font-medium
              ">
                {item}
              </a>
            </li>
          ))}
        </ul>

        <button className="
          p-2 rounded-lg
          text-gray-600 dark:text-gray-300
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-colors
        ">
          🌙
        </button>
      </nav>
    </header>
  );
}
```

---

Tailwind CSS v4는 **CSS를 설정 언어로 사용**하는 패러다임 전환을 이뤄냈습니다. 설정 파일이 사라지고 CSS 변수가 테마와 직접 연결되면서 더 직관적이고 강력해졌습니다. 새 프로젝트라면 v4로 시작하고, 기존 프로젝트는 `@tailwindcss/upgrade` CLI로 자동 마이그레이션을 시도해보세요.
