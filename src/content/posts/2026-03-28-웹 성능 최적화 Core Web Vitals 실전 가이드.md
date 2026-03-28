---
title: 웹 성능 최적화 완벽 가이드: Core Web Vitals 실전 기법
date: 2026-03-28
summary: LCP, INP, CLS 세 가지 Core Web Vitals 지표의 의미와 측정 방법을 이해하고, 이미지 최적화·코드 스플리팅·렌더링 전략 등 실무에서 바로 적용할 수 있는 성능 개선 기법을 정리합니다.
tags: [Performance, CoreWebVitals, Web, Optimization, Frontend]
---

웹 성능은 사용자 경험과 SEO 순위에 직접 영향을 줍니다. Google은 Core Web Vitals 세 지표를 검색 랭킹 신호로 사용하며, 좋은 점수는 이탈률 감소와 전환율 향상으로 이어집니다. 이 가이드에서는 지표의 의미부터 실전 최적화 기법까지 한 번에 정리합니다.

> 목표: Core Web Vitals 세 지표를 이해하고, 측정 → 분석 → 개선 사이클을 실무에 적용할 수 있다.

## 목차

1. [Core Web Vitals 개요](#1-core-web-vitals-개요)
2. [LCP — Largest Contentful Paint](#2-lcp--largest-contentful-paint)
3. [INP — Interaction to Next Paint](#3-inp--interaction-to-next-paint)
4. [CLS — Cumulative Layout Shift](#4-cls--cumulative-layout-shift)
5. [측정 도구와 워크플로우](#5-측정-도구와-워크플로우)
6. [이미지 최적화](#6-이미지-최적화)
7. [JavaScript 최적화: 코드 스플리팅과 지연 로딩](#7-javascript-최적화-코드-스플리팅과-지연-로딩)
8. [렌더링 전략 선택 가이드](#8-렌더링-전략-선택-가이드)
9. [폰트 최적화](#9-폰트-최적화)
10. [성능 예산과 CI 통합](#10-성능-예산과-ci-통합)

---

## 1. Core Web Vitals 개요

Core Web Vitals는 실제 사용자 경험을 수치화한 세 가지 지표입니다.

| 지표 | 측정 대상 | Good | Needs Improvement | Poor |
|------|-----------|------|-------------------|------|
| **LCP** | 로딩 성능 | ≤ 2.5s | 2.5s ~ 4.0s | > 4.0s |
| **INP** | 상호작용 응답성 | ≤ 200ms | 200ms ~ 500ms | > 500ms |
| **CLS** | 시각적 안정성 | ≤ 0.1 | 0.1 ~ 0.25 | > 0.25 |

> **INP는 2024년 3월에 FID를 대체**했습니다. FID는 첫 상호작용만 측정했지만 INP는 페이지 전체 생애 동안 모든 상호작용을 추적합니다.

---

## 2. LCP — Largest Contentful Paint

페이지에서 **가장 큰 콘텐츠 요소**가 뷰포트에 렌더링되는 시간입니다. 주로 히어로 이미지, 대형 텍스트 블록, 동영상 썸네일이 LCP 요소가 됩니다.

### LCP 개선 핵심 전략

**1) fetchpriority로 LCP 이미지 우선 로드**

```html
<!-- LCP 이미지에 fetchpriority="high" 추가 -->
<img
  src="/hero.webp"
  fetchpriority="high"
  alt="히어로 이미지"
  width="1200"
  height="600"
/>
```

**2) 리소스 힌트 활용**

```html
<head>
  <!-- LCP 이미지 사전 로드 -->
  <link rel="preload" as="image" href="/hero.webp" />

  <!-- 외부 도메인 연결 사전 준비 -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="dns-prefetch" href="https://cdn.example.com" />
</head>
```

**3) 서버 응답 시간(TTFB) 단축**

- CDN으로 정적 자산 배포
- HTTP/2 또는 HTTP/3 활성화
- Cache-Control 헤더로 브라우저 캐싱 설정

```nginx
# Nginx 예시 — 정적 자산 1년 캐싱
location ~* \.(js|css|png|webp|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

---

## 3. INP — Interaction to Next Paint

사용자의 클릭, 탭, 키 입력에 대해 브라우저가 **다음 화면을 그리기까지 걸리는 시간**입니다. 페이지 전체 생애에서 측정한 상호작용 중 **75번째 백분위수**가 INP 점수가 됩니다.

### INP 개선 핵심 전략

**1) 긴 태스크 분리 (Long Task 쪼개기)**

```js
// Bad — 메인 스레드를 200ms 이상 블로킹
function processLargeList(items) {
  items.forEach(item => heavyProcess(item));
}

// Good — scheduler.yield()로 메인 스레드 양보
async function processLargeList(items) {
  for (const item of items) {
    heavyProcess(item);
    // 브라우저가 사용자 입력을 처리할 기회 제공
    if ('scheduler' in window) {
      await scheduler.yield();
    } else {
      await new Promise(r => setTimeout(r, 0));
    }
  }
}
```

**2) 이벤트 핸들러를 가볍게 유지**

```tsx
// Bad — 클릭 시 무거운 계산 수행
function handleClick() {
  const result = expensiveCalculation(); // 블로킹
  setData(result);
}

// Good — 상태 업데이트 즉시, 무거운 작업은 비동기로
function handleClick() {
  setLoading(true); // 즉각 피드백
  startTransition(() => {
    const result = expensiveCalculation();
    setData(result);
    setLoading(false);
  });
}
```

**3) React의 `useTransition` / `useDeferredValue` 활용**

```tsx
import { useTransition, useDeferredValue } from 'react';

function SearchList({ items }: { items: string[] }) {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value); // 입력은 즉시 반영
    startTransition(() => {
      // 필터링은 우선순위 낮게 처리
    });
  }

  const filtered = items.filter(item =>
    item.toLowerCase().includes(deferredQuery.toLowerCase())
  );

  return (
    <>
      <input value={query} onChange={handleChange} />
      <ul style={{ opacity: isPending ? 0.7 : 1 }}>
        {filtered.map(item => <li key={item}>{item}</li>)}
      </ul>
    </>
  );
}
```

---

## 4. CLS — Cumulative Layout Shift

페이지 로드 중 **예상치 못한 레이아웃 이동**의 누적 점수입니다. 읽던 글이 갑자기 이동하거나 버튼 위치가 바뀌는 경험이 CLS 점수를 높입니다.

### CLS 원인과 해결책

| 원인 | 해결책 |
|------|--------|
| 크기 없는 이미지 | `width`, `height` 속성 명시 또는 `aspect-ratio` CSS |
| 동적으로 삽입되는 광고/배너 | 공간을 미리 예약 (`min-height`) |
| 폰트 교체(FOUT) | `font-display: optional` 또는 폰트 사전 로드 |
| 뒤늦게 로드되는 콘텐츠 | Skeleton UI로 공간 유지 |

**이미지 크기 명시**

```html
<!-- Bad — 이미지 로드 전후로 레이아웃 이동 발생 -->
<img src="/photo.jpg" alt="사진" />

<!-- Good — aspect ratio 유지로 공간 미리 확보 -->
<img src="/photo.jpg" alt="사진" width="800" height="600" />
```

```css
/* CSS로도 동일 효과 */
img {
  aspect-ratio: 4 / 3;
  width: 100%;
  height: auto;
}
```

**Skeleton UI 패턴**

```tsx
function ArticleCard({ isLoading, article }) {
  if (isLoading) {
    return (
      <div className="card skeleton">
        <div className="skeleton-image" /> {/* 이미지 공간 유지 */}
        <div className="skeleton-title" />
        <div className="skeleton-text" />
      </div>
    );
  }
  return (
    <div className="card">
      <img src={article.image} width={400} height={300} />
      <h2>{article.title}</h2>
      <p>{article.excerpt}</p>
    </div>
  );
}
```

---

## 5. 측정 도구와 워크플로우

### 도구 비교

| 도구 | 유형 | 특징 |
|------|------|------|
| **Lighthouse** | 합성 측정 | 개발 중 빠른 피드백, CI 통합 가능 |
| **PageSpeed Insights** | 합성 + 현장 | 실제 사용자 데이터(CrUX) 포함 |
| **Chrome DevTools** | 합성 측정 | 네트워크/CPU 쓰로틀링으로 저사양 시뮬레이션 |
| **web-vitals 라이브러리** | 현장 측정 | 실제 사용자 데이터 수집 |

### web-vitals 라이브러리로 현장 데이터 수집

```bash
npm install web-vitals
```

```ts
import { onLCP, onINP, onCLS } from 'web-vitals';

function sendToAnalytics(metric) {
  // GA4, Datadog, 자체 서버 등으로 전송
  navigator.sendBeacon('/analytics', JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    id: metric.id,
  }));
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

---

## 6. 이미지 최적화

이미지는 대부분의 페이지에서 가장 큰 바이트를 차지합니다.

### 포맷 선택 가이드

| 포맷 | 용도 | 특징 |
|------|------|------|
| **WebP** | 사진, 일반 이미지 | JPEG 대비 25~34% 작음 |
| **AVIF** | 사진 (최신 브라우저) | WebP 대비 추가 20% 절감 |
| **SVG** | 아이콘, 로고 | 해상도 독립적 |
| **PNG** | 투명도 필요 이미지 | 무손실 |

### `<picture>` 태그로 포맷 폴백

```html
<picture>
  <source srcset="/hero.avif" type="image/avif" />
  <source srcset="/hero.webp" type="image/webp" />
  <img src="/hero.jpg" alt="히어로 이미지" width="1200" height="600" />
</picture>
```

### Next.js Image 컴포넌트

```tsx
import Image from 'next/image';

// 자동으로 WebP/AVIF 변환, lazy loading, 크기 최적화
<Image
  src="/hero.jpg"
  alt="히어로 이미지"
  width={1200}
  height={600}
  priority // LCP 이미지에 사용 (preload 처리)
  sizes="(max-width: 768px) 100vw, 1200px"
/>
```

---

## 7. JavaScript 최적화: 코드 스플리팅과 지연 로딩

### Dynamic Import로 코드 스플리팅

```tsx
import { lazy, Suspense } from 'react';

// 초기 번들에서 제외 — 필요할 때 로드
const HeavyChart = lazy(() => import('./HeavyChart'));
const VideoPlayer = lazy(() => import('./VideoPlayer'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>차트 보기</button>
      {showChart && (
        <Suspense fallback={<div>차트 로딩 중...</div>}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

### 라이브러리 번들 크기 확인

```bash
# next.js 번들 분석
npm run build
npx @next/bundle-analyzer

# 일반 프로젝트
npx vite-bundle-visualizer
npx webpack-bundle-analyzer stats.json
```

### 트리 쉐이킹 확인

```ts
// Bad — 전체 lodash 임포트 (70KB+)
import _ from 'lodash';
const result = _.debounce(fn, 300);

// Good — 필요한 함수만 임포트 (2KB)
import debounce from 'lodash/debounce';
const result = debounce(fn, 300);

// Best — 네이티브 또는 경량 대안 사용
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

---

## 8. 렌더링 전략 선택 가이드

| 전략 | 언제 사용 | LCP | 동적 데이터 |
|------|-----------|-----|-------------|
| **SSG** (정적 생성) | 블로그, 문서 | 최고 | 불가 |
| **ISR** (증분 정적 재생성) | 제품 목록, 뉴스 | 좋음 | 주기적 |
| **SSR** (서버 사이드) | 개인화 콘텐츠 | 좋음 | 가능 |
| **CSR** (클라이언트 사이드) | 대시보드, 앱 | 낮음 | 완전 동적 |
| **Streaming SSR** | 복잡한 페이지 | 좋음 | 가능 |

### Streaming SSR — 빠른 TTFB + 점진적 렌더링

```tsx
// Next.js App Router — Suspense로 스트리밍
import { Suspense } from 'react';

export default function Page() {
  return (
    <main>
      {/* 즉시 렌더링 */}
      <Header />

      {/* 데이터 준비되면 스트리밍 */}
      <Suspense fallback={<ProductsSkeleton />}>
        <Products /> {/* async 서버 컴포넌트 */}
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews />
      </Suspense>
    </main>
  );
}
```

---

## 9. 폰트 최적화

### FOUT / FOIT 방지

```css
/* font-display: swap — 폴백 폰트 먼저 보여주고 교체 */
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/my-font.woff2') format('woff2');
  font-display: swap;
}

/* font-display: optional — 느리면 아예 사용 안 함 (CLS 0) */
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/my-font.woff2') format('woff2');
  font-display: optional;
}
```

### 서브셋 폰트로 파일 크기 줄이기

```bash
# pyftsubset으로 한글 서브셋 생성
pip install fonttools brotli
pyftsubset font.ttf \
  --unicodes="U+0020-007E,U+AC00-D7A3,U+1100-11FF" \
  --flavor=woff2 \
  --output-file=font-subset.woff2
```

### Next.js `next/font` 자동 최적화

```tsx
import { Inter, Noto_Sans_KR } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export default function Layout({ children }) {
  return (
    <html className={`${inter.variable} ${notoSansKR.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 10. 성능 예산과 CI 통합

성능을 유지하려면 자동화된 측정이 필수입니다. PR마다 성능 회귀를 감지합니다.

### Lighthouse CI 설정

```bash
npm install -g @lhci/cli
```

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci && npm run build
      - run: lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

```js
// lighthouserc.js — 성능 예산 설정
module.exports = {
  ci: {
    collect: { url: ['http://localhost:3000'] },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
```

---

웹 성능 최적화는 한 번에 끝내는 작업이 아닙니다. **측정 → 원인 분석 → 개선 → 재측정** 사이클을 반복하며, 실제 사용자 데이터(CrUX)와 합성 측정(Lighthouse)을 함께 활용하세요. LCP는 이미지·폰트 최적화와 서버 응답 시간으로, INP는 긴 태스크 분리와 React 전환 API로, CLS는 크기 명시와 Skeleton UI로 개선하는 것이 핵심입니다.
