---
title: TanStack Query 정리
date: 2026-03-03
summary: TanStack Query(React Query)의 핵심 개념부터 캐싱 전략, 무한 스크롤, Optimistic Update까지 실전 예제와 함께 완벽 정리
tags: [react, tanstack-query, react-query, 캐싱, 비동기, 서버상태관리, fetching]
---

# TanStack Query 정리

**TanStack Query**(구 React Query)는 서버 상태(Server State)를 효율적으로 관리하기 위한 비동기 데이터 패칭 라이브러리입니다.
캐싱, 동기화, 백그라운드 업데이트 등을 자동으로 처리해줘서 클라이언트 상태 관리 도구(Redux 등)가 담당하기 어려운 "서버와의 동기화" 문제를 해결합니다.

> 목표: TanStack Query의 **동작 원리를 이해**하고, **캐싱·최적화 전략**을 실전에 적용하는 능력 키우기

---

## 목차

1. [TanStack Query란?](#1-tanstack-query란)
2. [설치 및 기본 설정](#2-설치-및-기본-설정)
3. [useQuery - 데이터 조회](#3-usequery---데이터-조회)
4. [useMutation - 데이터 변경](#4-usemutation---데이터-변경)
5. [캐싱 전략 (staleTime & gcTime)](#5-캐싱-전략-staletime--gctime)
6. [쿼리 키 (Query Key)](#6-쿼리-키-query-key)
7. [Dependent Query & Parallel Query](#7-dependent-query--parallel-query)
8. [무한 스크롤 (useInfiniteQuery)](#8-무한-스크롤-useinfinitequery)
9. [Optimistic Update](#9-optimistic-update)
10. [Prefetching & 초기 데이터](#10-prefetching--초기-데이터)
11. [전역 설정 & QueryClient 활용](#11-전역-설정--queryclient-활용)
12. [실전 Best Practices](#12-실전-best-practices)

---

## 1. TanStack Query란?

### 1.1 서버 상태 vs 클라이언트 상태

| 구분 | 예시 | 특징 |
|------|------|------|
| **클라이언트 상태** | 모달 열림 여부, UI 토글 | 클라이언트가 직접 소유, 동기적 |
| **서버 상태** | 유저 목록, 게시글 데이터 | 원격에 저장, 비동기, 만료 가능 |

서버 상태는 다음과 같은 고민이 항상 따릅니다:
- 캐싱 (언제까지 신선한 데이터인가?)
- 중복 요청 제거
- 백그라운드에서 최신 데이터 갱신
- 페이지네이션 / 무한 스크롤
- 낙관적 업데이트(Optimistic Update)

TanStack Query는 이 모든 것을 기본 제공합니다.

### 1.2 핵심 개념 한눈에 보기

```
┌──────────────────────────────────────────────┐
│               QueryClient                    │
│  ┌────────────────────────────────────────┐  │
│  │            QueryCache                  │  │
│  │  [queryKey] → { data, status, ... }    │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
         ↕ (자동 캐싱 / 갱신 / 동기화)
   useQuery / useMutation / useInfiniteQuery
```

---

## 2. 설치 및 기본 설정

```bash
# React 프로젝트 기준
npm install @tanstack/react-query
# 개발 도구 (선택)
npm install @tanstack/react-query-devtools
```

### 2.1 QueryClientProvider 설정

```tsx
// main.tsx 또는 App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5분
      retry: 1,                   // 실패 시 1회 재시도
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## 3. useQuery - 데이터 조회

### 3.1 기본 사용법

```tsx
import { useQuery } from '@tanstack/react-query'

const fetchUser = async (id: number) => {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error('유저 조회 실패')
  return res.json()
}

function UserProfile({ userId }: { userId: number }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  if (isLoading) return <Spinner />
  if (isError) return <p>에러: {error.message}</p>

  return <div>{data.name}</div>
}
```

### 3.2 반환값 정리

| 반환값 | 설명 |
|--------|------|
| `data` | 성공 시 서버 응답 데이터 |
| `isLoading` | 최초 로딩 중 (캐시 없음) |
| `isFetching` | 백그라운드 포함 모든 fetching 상태 |
| `isError` | 에러 발생 여부 |
| `error` | 에러 객체 |
| `isSuccess` | 성공 여부 |
| `refetch` | 수동으로 다시 fetching |
| `status` | `'pending' \| 'error' \| 'success'` |
| `fetchStatus` | `'fetching' \| 'paused' \| 'idle'` |

### 3.3 주요 옵션

```tsx
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 1000 * 60,      // 1분 동안 신선한 상태 유지
  gcTime: 1000 * 60 * 5,     // 5분 후 캐시 삭제 (구 cacheTime)
  refetchOnWindowFocus: true, // 탭 포커스 시 재조회
  refetchInterval: 5000,      // 5초마다 폴링
  enabled: !!userId,          // 조건부 실행
  select: (data) => data.items, // 데이터 변환
  placeholderData: [],        // 로딩 전 임시 데이터
})
```

---

## 4. useMutation - 데이터 변경

POST / PUT / DELETE 같은 데이터 변경 작업에 사용합니다.

### 4.1 기본 사용법

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

const createPost = async (newPost: { title: string; body: string }) => {
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPost),
  })
  return res.json()
}

function CreatePost() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // 캐시 무효화 → 자동 재조회
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (error) => {
      console.error('생성 실패:', error)
    },
  })

  const handleSubmit = () => {
    mutation.mutate({ title: '새 포스트', body: '내용' })
  }

  return (
    <button onClick={handleSubmit} disabled={mutation.isPending}>
      {mutation.isPending ? '저장 중...' : '저장'}
    </button>
  )
}
```

### 4.2 반환값 정리

| 반환값 | 설명 |
|--------|------|
| `mutate(vars)` | 동기 실행 (에러를 throw하지 않음) |
| `mutateAsync(vars)` | 비동기 실행 (try/catch 사용 가능) |
| `isPending` | 실행 중 |
| `isSuccess` | 성공 |
| `isError` | 에러 |
| `data` | 성공 시 응답 데이터 |
| `reset()` | 상태 초기화 |

---

## 5. 캐싱 전략 (staleTime & gcTime)

TanStack Query 캐싱의 핵심은 두 가지 시간 개념입니다.

```
데이터 fetch 완료
       │
       ▼
  [Fresh 상태] ←── staleTime 동안 유지
       │
  staleTime 초과
       │
       ▼
  [Stale 상태] ←── 백그라운드에서 재요청 트리거 가능
       │
  컴포넌트 언마운트
       │
       ▼
  [Inactive 상태] ←── gcTime 동안 캐시 유지
       │
  gcTime 초과
       │
       ▼
  [캐시 삭제]
```

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `staleTime` | `0` | 데이터가 신선한(fresh) 상태로 유지되는 시간 (ms) |
| `gcTime` | `5분` | 캐시가 메모리에 유지되는 시간 (ms) |

```tsx
// 자주 바뀌지 않는 데이터: staleTime 길게
useQuery({
  queryKey: ['categories'],
  queryFn: fetchCategories,
  staleTime: 1000 * 60 * 30, // 30분
})

// 실시간성 중요: staleTime 짧게 + 폴링
useQuery({
  queryKey: ['dashboard'],
  queryFn: fetchDashboard,
  staleTime: 0,
  refetchInterval: 3000, // 3초마다
})
```

---

## 6. 쿼리 키 (Query Key)

쿼리 키는 캐시의 식별자입니다. 키가 달라지면 별도의 캐시 항목이 됩니다.

### 6.1 키 구조 설계

```tsx
// ✅ 계층적으로 설계 (범위 → 세부)
['users']                          // 전체 유저
['users', 1]                       // id=1 유저
['users', 1, 'posts']             // id=1 유저의 게시글
['posts', { page: 2, limit: 10 }] // 파라미터 포함
```

### 6.2 쿼리 키 팩토리 패턴

여러 곳에서 같은 키를 쓸 때 상수로 관리하면 오타를 방지합니다.

```tsx
// queryKeys.ts
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: object) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
}

// 사용
useQuery({ queryKey: postKeys.detail(postId), queryFn: ... })
queryClient.invalidateQueries({ queryKey: postKeys.lists() })
```

---

## 7. Dependent Query & Parallel Query

### 7.1 의존적 쿼리 (Dependent Query)

이전 쿼리 결과가 있어야 실행되는 쿼리입니다.

```tsx
function UserPosts({ username }: { username: string }) {
  // 1단계: 유저 조회
  const { data: user } = useQuery({
    queryKey: ['user', username],
    queryFn: () => fetchUser(username),
  })

  // 2단계: 유저 ID로 게시글 조회 (user가 있을 때만 실행)
  const { data: posts } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: () => fetchPosts(user!.id),
    enabled: !!user?.id,  // ← 핵심: user.id가 있을 때만 활성화
  })

  return <PostList posts={posts} />
}
```

### 7.2 병렬 쿼리 (Parallel Query)

동시에 여러 쿼리를 실행합니다.

```tsx
// 정적 병렬
function Dashboard() {
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const postsQuery = useQuery({ queryKey: ['posts'], queryFn: fetchPosts })

  // 두 쿼리는 동시에 실행됨
}

// 동적 병렬 (useQueries)
function MultiPostView({ ids }: { ids: number[] }) {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['post', id],
      queryFn: () => fetchPost(id),
    })),
  })

  return results.map((result, i) => <PostCard key={ids[i]} post={result.data} />)
}
```

---

## 8. 무한 스크롤 (useInfiniteQuery)

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'
import { useIntersectionObserver } from './hooks/useIntersectionObserver'

const fetchPosts = async ({ pageParam = 1 }) => {
  const res = await fetch(`/api/posts?page=${pageParam}&limit=10`)
  return res.json() // { data: [], nextPage: 2, hasNextPage: true }
}

function InfinitePostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: fetchPosts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextPage : undefined,
  })

  // 마지막 요소 관찰 → 자동 다음 페이지 로드
  const { ref } = useIntersectionObserver({
    onIntersect: () => { if (hasNextPage) fetchNextPage() },
  })

  const posts = data?.pages.flatMap((page) => page.data) ?? []

  return (
    <div>
      {posts.map((post) => <PostCard key={post.id} post={post} />)}
      <div ref={ref}>
        {isFetchingNextPage ? <Spinner /> : null}
      </div>
    </div>
  )
}
```

---

## 9. Optimistic Update

서버 응답을 기다리지 않고 UI를 먼저 업데이트한 후, 실패 시 롤백하는 패턴입니다.

```tsx
function ToggleLike({ postId, liked }: { postId: number; liked: boolean }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => toggleLike(postId),

    // 요청 직전에 실행
    onMutate: async () => {
      // 진행 중인 refetch 취소 (충돌 방지)
      await queryClient.cancelQueries({ queryKey: ['post', postId] })

      // 현재 캐시 스냅샷 저장 (롤백용)
      const previousPost = queryClient.getQueryData(['post', postId])

      // UI 낙관적 업데이트
      queryClient.setQueryData(['post', postId], (old: Post) => ({
        ...old,
        liked: !old.liked,
        likeCount: old.liked ? old.likeCount - 1 : old.likeCount + 1,
      }))

      return { previousPost } // context로 전달
    },

    // 실패 시 롤백
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['post', postId], context?.previousPost)
    },

    // 성공/실패 모두 최종 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })

  return (
    <button onClick={() => mutation.mutate()}>
      {liked ? '♥ 좋아요 취소' : '♡ 좋아요'}
    </button>
  )
}
```

---

## 10. Prefetching & 초기 데이터

### 10.1 Prefetching

사용자가 페이지를 방문하기 전에 미리 데이터를 캐싱합니다.

```tsx
// 마우스를 올릴 때 미리 fetching
function PostLink({ postId }: { postId: number }) {
  const queryClient = useQueryClient()

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['post', postId],
      queryFn: () => fetchPost(postId),
      staleTime: 1000 * 60, // 1분 이내 캐시가 있으면 skip
    })
  }

  return (
    <Link to={`/posts/${postId}`} onMouseEnter={prefetch}>
      게시글 보기
    </Link>
  )
}
```

### 10.2 initialData vs placeholderData

| 구분 | `initialData` | `placeholderData` |
|------|---------------|-------------------|
| 캐시 저장 여부 | ✅ 캐시에 저장됨 | ❌ 캐시에 저장 안 됨 |
| staleTime 적용 | ✅ 적용됨 | ❌ 항상 stale로 간주 |
| 사용 케이스 | 부모로부터 내려온 실제 데이터 | 로딩 전 UI 스켈레톤용 |

```tsx
// initialData: 목록에서 상세 페이지로 이동 시
useQuery({
  queryKey: ['post', postId],
  queryFn: () => fetchPost(postId),
  initialData: () =>
    queryClient.getQueryData<Post[]>(['posts'])?.find((p) => p.id === postId),
  initialDataUpdatedAt: () =>
    queryClient.getQueryState(['posts'])?.dataUpdatedAt,
})
```

---

## 11. 전역 설정 & QueryClient 활용

### 11.1 QueryClient 주요 메서드

```tsx
const queryClient = useQueryClient()

// 캐시 무효화 (재조회 트리거)
queryClient.invalidateQueries({ queryKey: ['posts'] })

// 캐시 직접 조회
const data = queryClient.getQueryData(['post', 1])

// 캐시 직접 수정
queryClient.setQueryData(['post', 1], (old) => ({ ...old, title: '수정됨' }))

// 캐시 삭제
queryClient.removeQueries({ queryKey: ['posts'] })

// 모든 캐시 초기화 (로그아웃 시 유용)
queryClient.clear()
```

### 11.2 에러 처리 전역화

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: true, // ErrorBoundary와 연동
    },
    mutations: {
      onError: (error) => {
        toast.error(`요청 실패: ${error.message}`)
      },
    },
  },
})
```

---

## 12. 실전 Best Practices

### ✅ Custom Hook으로 추상화

컴포넌트에서 useQuery를 직접 쓰는 대신 커스텀 훅으로 감싸면 재사용성과 테스트 용이성이 높아집니다.

```tsx
// hooks/usePosts.ts
export const usePosts = (filters?: PostFilters) => {
  return useQuery({
    queryKey: postKeys.list(filters ?? {}),
    queryFn: () => fetchPosts(filters),
    staleTime: 1000 * 60 * 3,
  })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.lists() }),
  })
}
```

### ✅ 올바른 staleTime 설정 기준

```
데이터 변경 빈도      권장 staleTime
───────────────────────────────────
실시간 (주가, 채팅)  → 0 + refetchInterval
자주 (댓글, 알림)    → 30초 ~ 1분
보통 (게시글)        → 3 ~ 10분
거의 없음 (카테고리) → 30분 ~ 무한대
```

### ✅ invalidateQueries vs setQueryData

```tsx
// invalidateQueries: 서버와 동기화가 중요할 때
queryClient.invalidateQueries({ queryKey: ['posts'] })
// → 캐시를 stale 처리 후 백그라운드 재조회

// setQueryData: 서버 응답 데이터가 확실할 때 (Optimistic / 응답값 직접 반영)
queryClient.setQueryData(['post', id], responseData)
// → 네트워크 요청 없이 즉시 캐시 업데이트
```

### ✅ Suspense 모드 (React 18+)

```tsx
// useQuery에 suspense 옵션 대신 useSuspenseQuery 사용
import { useSuspenseQuery } from '@tanstack/react-query'

function PostDetail({ id }: { id: number }) {
  // 로딩 중엔 상위 Suspense로 제어됨 (isLoading 불필요)
  const { data } = useSuspenseQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
  })
  return <div>{data.title}</div>
}

// 상위 컴포넌트
<ErrorBoundary fallback={<ErrorPage />}>
  <Suspense fallback={<Skeleton />}>
    <PostDetail id={1} />
  </Suspense>
</ErrorBoundary>
```

---

## 정리

| 개념 | 핵심 요약 |
|------|-----------|
| `useQuery` | 데이터 읽기 + 캐싱 자동화 |
| `useMutation` | 데이터 쓰기 + 성공/실패 처리 |
| `staleTime` | 신선도 유지 시간 (짧을수록 자주 재요청) |
| `gcTime` | 메모리 캐시 유지 시간 |
| Query Key | 캐시 식별자, 계층 구조로 관리 |
| `enabled` | 조건부 쿼리 실행 |
| `invalidateQueries` | 캐시 무효화 → 재조회 트리거 |
| Optimistic Update | 낙관적 업데이트 + 실패 시 롤백 |
| `useInfiniteQuery` | 무한 스크롤 / 페이지네이션 |
| `prefetchQuery` | 사전 캐싱으로 UX 개선 |

> TanStack Query는 단순한 fetching 라이브러리가 아니라 **서버 상태 동기화 엔진**입니다.
> `staleTime`과 `invalidateQueries`를 중심으로 캐시 전략을 설계하면 불필요한 네트워크 요청을 줄이고, 항상 최신 데이터를 보여주는 앱을 만들 수 있습니다.
