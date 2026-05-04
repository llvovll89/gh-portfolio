---
title: TanStack Query 완벽 정리 — 서버 상태 관리의 표준
date: 2026-05-04
summary: TanStack Query v5의 핵심 개념부터 캐싱 전략, 낙관적 업데이트, 무한 스크롤까지 실전 패턴 중심으로 정리합니다. Redux 없이 서버 상태를 우아하게 다루는 방법을 다룹니다.
tags: [TanStack Query, React Query, React, TypeScript, 서버상태관리, 캐싱]
---

프론트엔드 상태는 크게 두 종류입니다. UI 상태(모달 열림 여부, 탭 선택 등)와 **서버 상태**(API에서 온 데이터)입니다. Redux나 Zustand 같은 클라이언트 상태 관리 도구로 서버 상태까지 관리하면 로딩·에러 처리, 캐시 무효화, 리페치 로직을 직접 구현해야 합니다. **TanStack Query**는 이 서버 상태 문제를 전문적으로 해결합니다.

> 목표: TanStack Query v5의 핵심 API를 이해하고, useQuery·useMutation·useInfiniteQuery를 실전 패턴으로 활용하며, 캐싱과 낙관적 업데이트까지 자유롭게 다룬다.

## 목차

1. [TanStack Query란 & 왜 쓰는가](#1-tanstack-query란--왜-쓰는가)
2. [설치 및 기본 설정](#2-설치-및-기본-설정)
3. [useQuery — 데이터 조회](#3-usequery--데이터-조회)
4. [쿼리 키 설계 전략](#4-쿼리-키-설계-전략)
5. [useMutation — 데이터 변경](#5-usemutation--데이터-변경)
6. [캐싱 동작 원리](#6-캐싱-동작-원리)
7. [useInfiniteQuery — 무한 스크롤](#7-useinfinitequery--무한-스크롤)
8. [낙관적 업데이트](#8-낙관적-업데이트)
9. [QueryClient 직접 제어](#9-queryclient-직접-제어)
10. [실무 패턴 & 팁](#10-실무-패턴--팁)

---

## 1. TanStack Query란 & 왜 쓰는가

TanStack Query(구 React Query)는 서버 상태를 위한 비동기 상태 관리 라이브러리입니다. v5부터 React 외에도 Vue, Solid, Svelte를 지원하며 패키지명이 `@tanstack/react-query`로 통일됐습니다.

**TanStack Query가 자동으로 해주는 것들**

| 기능 | 직접 구현 시 | TanStack Query |
|------|-------------|----------------|
| 로딩/에러 상태 | `useState` 2개 + try-catch | `isPending`, `isError` 자동 제공 |
| 캐싱 | 없음 → 매번 네트워크 요청 | 동일 키면 캐시 반환 |
| 중복 요청 제거 | 복잡한 ref 관리 | 동일 키 동시 요청 자동 dedup |
| 포커스 시 리페치 | 직접 이벤트 리스너 | `refetchOnWindowFocus` 기본 활성 |
| 백그라운드 갱신 | 없음 | `staleTime` 지나면 자동 갱신 |
| 페이지네이션 | 복잡한 상태 관리 | `useInfiniteQuery` |

---

## 2. 설치 및 기본 설정

```bash
npm install @tanstack/react-query
npm install -D @tanstack/react-query-devtools
```

### QueryClient 및 Provider 설정

```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5분간 fresh 상태 유지
      retry: 1,                    // 실패 시 1회 재시도
      refetchOnWindowFocus: false, // 탭 포커스 시 자동 리페치 비활성 (선택)
    },
  },
});

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
```

---

## 3. useQuery — 데이터 조회

### 기본 사용법

```tsx
import { useQuery } from '@tanstack/react-query';

interface Post {
  id: number;
  title: string;
  body: string;
}

const fetchPost = async (id: number): Promise<Post> => {
  const res = await fetch(`/api/posts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
};

export const PostDetail = ({ postId }: { postId: number }) => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => fetchPost(postId),
  });

  if (isPending) return <Spinner />;
  if (isError) return <p>에러: {error.message}</p>;

  return <article>{data.title}</article>;
};
```

### useQuery 주요 반환값

| 값 | 설명 |
|----|------|
| `data` | 성공 시 데이터 |
| `isPending` | 데이터 없음 + 로딩 중 |
| `isFetching` | 백그라운드 갱신 포함 모든 요청 중 |
| `isError` | 에러 발생 |
| `error` | 에러 객체 |
| `isStale` | staleTime 초과 여부 |
| `refetch` | 수동 리페치 함수 |

> **v5 변경점**: `isLoading`이 `isPending`으로 이름이 바뀌었습니다. `isLoading`은 `isPending && isFetching`의 조합으로 여전히 존재하지만 `isPending` 사용을 권장합니다.

### enabled 옵션 — 조건부 쿼리

```tsx
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // userId가 있을 때만 실행
});

const { data: posts } = useQuery({
  queryKey: ['posts', 'user', user?.id],
  queryFn: () => fetchUserPosts(user!.id),
  enabled: !!user, // user 쿼리가 성공한 후 실행 (순차 의존)
});
```

### select — 데이터 변환

```tsx
const { data: postTitles } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchAllPosts,
  // 캐시는 원본 유지, 컴포넌트에는 변환된 데이터만 전달
  select: (posts) => posts.map(p => p.title),
});
```

---

## 4. 쿼리 키 설계 전략

쿼리 키는 캐시의 식별자입니다. 배열 형태로 작성하며 직렬화 가능한 값이면 모두 사용 가능합니다.

```typescript
// queryKeys.ts — 중앙 관리 권장
export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters: PostFilters) => [...queryKeys.posts.lists(), filters] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.posts.details(), id] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: number) => ['users', id] as const,
  },
} as const;
```

```tsx
// 사용
useQuery({
  queryKey: queryKeys.posts.detail(postId),
  queryFn: () => fetchPost(postId),
});

// 무효화 — 'posts' 관련 모든 캐시 삭제
queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
```

**계층 구조로 설계하면 `invalidateQueries`로 범위 지정 무효화가 가능합니다.**

---

## 5. useMutation — 데이터 변경

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreatePostInput {
  title: string;
  body: string;
}

const createPost = async (input: CreatePostInput) => {
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('생성 실패');
  return res.json();
};

export const CreatePostForm = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,

    onSuccess: (newPost) => {
      // 성공 후 목록 캐시 무효화 → 자동 리페치
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      // 또는 캐시에 직접 추가 (리페치 없이)
      queryClient.setQueryData(queryKeys.posts.detail(newPost.id), newPost);
    },

    onError: (error) => {
      alert(`오류: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    mutation.mutate({
      title: form.get('title') as string,
      body: form.get('body') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="제목" />
      <textarea name="body" placeholder="내용" />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '저장 중...' : '저장'}
      </button>
      {mutation.isError && <p className="text-red-500">{mutation.error.message}</p>}
    </form>
  );
};
```

### mutate vs mutateAsync

```typescript
// mutate — 콜백 기반, 에러를 throw하지 않음 (권장)
mutation.mutate(input, {
  onSuccess: () => router.push('/posts'),
});

// mutateAsync — Promise 반환, try-catch 필요
try {
  const result = await mutation.mutateAsync(input);
  router.push(`/posts/${result.id}`);
} catch (e) {
  // 반드시 처리해야 unhandledRejection 방지
}
```

---

## 6. 캐싱 동작 원리

```
요청 발생
  │
  ├─ 캐시 없음 → 네트워크 요청 → 캐시 저장 (fresh)
  │
  └─ 캐시 있음
        │
        ├─ fresh (staleTime 이내) → 캐시 반환 (네트워크 없음)
        │
        └─ stale (staleTime 초과) → 캐시 즉시 반환 + 백그라운드 리페치
```

### staleTime vs gcTime

| 옵션 | 기본값 | 의미 |
|------|--------|------|
| `staleTime` | `0` | 데이터가 fresh로 간주되는 시간 (이 시간 동안 재요청 없음) |
| `gcTime` | `5분` | 구독자가 없는 캐시가 메모리에서 삭제되기까지 대기 시간 |

```typescript
// 자주 바뀌지 않는 설정 데이터 — 1시간 fresh
useQuery({
  queryKey: ['config'],
  queryFn: fetchConfig,
  staleTime: 1000 * 60 * 60,
});

// 실시간성이 중요한 데이터 — 즉시 stale
useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  staleTime: 0,
  refetchInterval: 30_000, // 30초마다 폴링
});
```

---

## 7. useInfiniteQuery — 무한 스크롤

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

interface PostPage {
  posts: Post[];
  nextCursor: number | null;
}

const fetchPostPage = async ({ pageParam }: { pageParam: number }): Promise<PostPage> => {
  const res = await fetch(`/api/posts?cursor=${pageParam}&limit=10`);
  return res.json();
};

export const InfinitePostList = () => {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: fetchPostPage,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  // 하단 sentinel이 뷰포트에 들어오면 다음 페이지 로드
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) return <Spinner />;

  return (
    <>
      <ul>
        {data.pages.map((page, i) => (
          page.posts.map(post => (
            <li key={post.id}>{post.title}</li>
          ))
        ))}
      </ul>

      {/* 이 div가 보이면 다음 페이지 로드 */}
      <div ref={ref} className="h-10" />
      {isFetchingNextPage && <Spinner />}
      {!hasNextPage && <p className="text-center text-gray-500">마지막 페이지입니다.</p>}
    </>
  );
};
```

---

## 8. 낙관적 업데이트

서버 응답을 기다리지 않고 UI를 먼저 업데이트해 UX를 개선합니다. 실패 시 롤백합니다.

```tsx
const toggleLike = async (postId: number) => {
  await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
};

export const LikeButton = ({ postId }: { postId: number }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => toggleLike(postId),

    onMutate: async () => {
      // 진행 중인 리페치 취소 (낙관적 업데이트를 덮어쓰지 못하도록)
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) });

      // 이전 값 스냅샷
      const previousPost = queryClient.getQueryData<Post>(queryKeys.posts.detail(postId));

      // 캐시 낙관적 업데이트
      queryClient.setQueryData<Post>(queryKeys.posts.detail(postId), (old) =>
        old ? { ...old, likeCount: old.likeCount + 1, isLiked: !old.isLiked } : old
      );

      return { previousPost }; // context에 저장 → onError에서 참조
    },

    onError: (_err, _vars, context) => {
      // 실패 시 이전 값으로 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousPost);
      }
    },

    onSettled: () => {
      // 성공/실패 모두 최종적으로 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });

  return (
    <button onClick={() => mutation.mutate()}>
      ♥ {data?.likeCount}
    </button>
  );
};
```

---

## 9. QueryClient 직접 제어

```typescript
const queryClient = useQueryClient();

// 특정 쿼리 수동 리페치
queryClient.invalidateQueries({ queryKey: ['posts'] });

// 캐시 데이터 직접 읽기
const post = queryClient.getQueryData<Post>(['posts', 1]);

// 캐시 데이터 직접 쓰기 (서버 응답 캐싱)
queryClient.setQueryData(['posts', newPost.id], newPost);

// 쿼리 미리 로드 (hover 프리페치 등)
await queryClient.prefetchQuery({
  queryKey: ['posts', postId],
  queryFn: () => fetchPost(postId),
});

// 모든 캐시 초기화 (로그아웃 시)
queryClient.clear();
```

### 커스텀 훅으로 캡슐화

```typescript
// hooks/usePosts.ts — API 로직과 쿼리 키를 한 곳에서 관리
export const usePosts = (filters?: PostFilters) =>
  useQuery({
    queryKey: queryKeys.posts.list(filters ?? {}),
    queryFn: () => fetchPosts(filters),
  });

export const usePost = (id: number) =>
  useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => fetchPost(id),
    enabled: !!id,
  });

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() }),
  });
};
```

---

## 10. 실무 패턴 & 팁

### 에러 바운더리와 연동

```tsx
// v5에서 throwOnError 옵션으로 에러 바운더리에 에러 전파
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  throwOnError: true, // React ErrorBoundary가 잡음
});
```

### Suspense 모드

```tsx
// useSuspenseQuery — data가 항상 non-undefined 보장
import { useSuspenseQuery } from '@tanstack/react-query';

const PostDetail = ({ id }: { id: number }) => {
  // Suspense로 감싸면 isPending 분기 불필요
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => fetchPost(id),
  });
  // data가 항상 Post 타입 (undefined 없음)
  return <h1>{data.title}</h1>;
};

// 사용 측
<Suspense fallback={<Spinner />}>
  <ErrorBoundary fallback={<ErrorPage />}>
    <PostDetail id={1} />
  </ErrorBoundary>
</Suspense>
```

### 쿼리 상태별 UI 패턴 정리

```tsx
const { data, isPending, isFetching, isError, isStale } = useQuery(/* ... */);

// isPending: 최초 로딩 (캐시 없음)
// isFetching: 캐시 있어도 백그라운드 요청 중이면 true
// → 로딩 스피너는 isPending, 상단 진행 바는 isFetching에 연결

return (
  <>
    {isFetching && <TopProgressBar />}    {/* 백그라운드 갱신 표시 */}
    {isPending ? <Spinner /> : <Content data={data} />}
  </>
);
```

### 자주 하는 실수

| 실수 | 올바른 방법 |
|------|-------------|
| queryFn 안에서 에러를 삼킴 | 반드시 `throw`해야 `isError` 상태로 전환 |
| queryKey에 함수나 Date 객체 사용 | 직렬화 가능한 값만 사용 |
| mutation 후 invalidate 없이 UI 갱신 기대 | `onSuccess`에서 `invalidateQueries` 호출 |
| 컴포넌트마다 다른 queryKey로 같은 데이터 요청 | 키 팩토리 패턴으로 통일 |
| gcTime을 0으로 설정 | 언마운트 즉시 캐시 삭제 → 성능 저하 |
