---
title: TanStack Query + Zustand 실전 패턴
date: 2026-03-03
summary: TanStack Query(서버 상태)와 Zustand(클라이언트 상태)를 함께 사용하는 실전 예제 - 인증, 장바구니, 무한스크롤, 필터링까지
tags: [react, tanstack-query, zustand, 상태관리, 실전패턴, typescript, 인증, 장바구니]
---

# TanStack Query + Zustand 실전 패턴

**TanStack Query**와 **Zustand**는 서로 다른 영역의 상태를 담당합니다.
둘을 함께 사용하면 역할이 명확하게 분리되어 유지보수하기 좋은 구조를 만들 수 있습니다.

```
┌─────────────────────────────────────────────────────┐
│                    상태 분리 원칙                     │
│                                                     │
│  Zustand          │  TanStack Query                 │
│  ─────────────    │  ────────────────               │
│  ✅ 인증 토큰      │  ✅ 유저 프로필 (서버)            │
│  ✅ 장바구니       │  ✅ 상품 목록 (서버)              │
│  ✅ 테마/언어      │  ✅ 게시글/댓글 (서버)            │
│  ✅ UI 상태        │  ✅ 주문 내역 (서버)              │
│  ✅ 필터 조건      │  ✅ 알림 (서버)                  │
└─────────────────────────────────────────────────────┘
```

> 핵심 원칙: **"어디서 왔냐"로 구분한다**
> 서버에서 오는 데이터 → TanStack Query / 클라이언트가 직접 소유하는 상태 → Zustand

---

## 목차

1. [프로젝트 기본 셋업](#1-프로젝트-기본-셋업)
2. [실전 예제 1 - 인증 (로그인/로그아웃)](#2-실전-예제-1---인증-로그인로그아웃)
3. [실전 예제 2 - 상품 목록 + 필터](#3-실전-예제-2---상품-목록--필터)
4. [실전 예제 3 - 장바구니 + 주문](#4-실전-예제-3---장바구니--주문)
5. [실전 예제 4 - 무한 스크롤 + 검색](#5-실전-예제-4---무한-스크롤--검색)
6. [실전 예제 5 - 좋아요 Optimistic Update](#6-실전-예제-5---좋아요-optimistic-update)
7. [실전 예제 6 - 알림 실시간 폴링](#7-실전-예제-6---알림-실시간-폴링)
8. [패턴 정리 및 폴더 구조](#8-패턴-정리-및-폴더-구조)

---

## 1. 프로젝트 기본 셋업

```bash
npm install @tanstack/react-query zustand
npm install @tanstack/react-query-devtools
npm install immer  # (선택) 중첩 상태 처리
```

### 1.1 전체 Provider 구성

```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3,  // 3분
      retry: 1,
      throwOnError: false,
    },
    mutations: {
      onError: (error) => {
        console.error('[Mutation Error]', error)
      },
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
// Zustand는 Provider 불필요 ← 이게 Zustand의 장점
```

### 1.2 공통 API 클라이언트 (axios)

```ts
// lib/axios.ts
import axios from 'axios'
import { useAuthStore } from '@/store/useAuthStore'

export const api = axios.create({
  baseURL: '/api',
  timeout: 10_000,
})

// 요청마다 토큰 자동 주입 (Zustand 상태를 컴포넌트 밖에서 접근)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 응답 시 자동 로그아웃
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)
```

---

## 2. 실전 예제 1 - 인증 (로그인/로그아웃)

**역할 분리**:
- Zustand → 토큰, 로그인 여부 (클라이언트가 소유)
- TanStack Query → 유저 프로필 (서버에서 조회)

### 2.1 Zustand - 인증 스토어

```ts
// store/useAuthStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthStore = {
  token: string | null
  isAuthenticated: boolean
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      setToken: (token) => set({ token, isAuthenticated: true }),
      logout: () => set({ token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth',
      partialize: (s) => ({ token: s.token }),  // token만 localStorage에 저장
    }
  )
)
```

### 2.2 TanStack Query - 유저 프로필

```ts
// hooks/useProfile.ts
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { api } from '@/lib/axios'

const fetchProfile = async () => {
  const { data } = await api.get('/users/me')
  return data
}

export const useProfile = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: isAuthenticated,  // 로그인됐을 때만 조회
    staleTime: 1000 * 60 * 10, // 10분 캐싱
  })
}
```

### 2.3 TanStack Query - 로그인 뮤테이션

```ts
// hooks/useLogin.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { api } from '@/lib/axios'

type LoginPayload = { email: string; password: string }

export const useLogin = () => {
  const queryClient = useQueryClient()
  const setToken = useAuthStore((s) => s.setToken)

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post('/auth/login', payload)
      return data // { token, user }
    },
    onSuccess: ({ token }) => {
      // 1. Zustand에 토큰 저장
      setToken(token)
      // 2. 프로필 캐시 무효화 → 자동 재조회
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
```

### 2.4 TanStack Query - 로그아웃

```ts
// hooks/useLogout.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { api } from '@/lib/axios'

export const useLogout = () => {
  const queryClient = useQueryClient()
  const logout = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      // 성공/실패 관계없이
      logout()                  // Zustand 토큰 초기화
      queryClient.clear()       // 모든 서버 상태 캐시 삭제
    },
  })
}
```

### 2.5 컴포넌트에서 사용

```tsx
// components/LoginForm.tsx
function LoginForm() {
  const { mutate: login, isPending, error } = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ email, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit" disabled={isPending}>
        {isPending ? '로그인 중...' : '로그인'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  )
}

// components/Header.tsx
function Header() {
  const { data: profile } = useProfile()          // TanStack Query
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated) // Zustand
  const { mutate: logout } = useLogout()

  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>{profile?.name}</span>
          <button onClick={() => logout()}>로그아웃</button>
        </>
      ) : (
        <Link to="/login">로그인</Link>
      )}
    </header>
  )
}
```

---

## 3. 실전 예제 2 - 상품 목록 + 필터

**역할 분리**:
- Zustand → 필터 조건, 정렬 기준 (UI 상태)
- TanStack Query → 필터 조건으로 조회한 상품 목록 (서버 데이터)

### 3.1 Zustand - 필터 스토어

```ts
// store/useFilterStore.ts
import { create } from 'zustand'

type FilterStore = {
  category: string
  sortBy: 'price_asc' | 'price_desc' | 'latest'
  minPrice: number
  maxPrice: number
  setCategory: (category: string) => void
  setSortBy: (sortBy: FilterStore['sortBy']) => void
  setPriceRange: (min: number, max: number) => void
  resetFilters: () => void
}

const initialFilters = {
  category: 'all',
  sortBy: 'latest' as const,
  minPrice: 0,
  maxPrice: 1_000_000,
}

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialFilters,
  setCategory: (category) => set({ category }),
  setSortBy: (sortBy) => set({ sortBy }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
  resetFilters: () => set(initialFilters),
}))
```

### 3.2 TanStack Query - 필터 연동 상품 조회

```ts
// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { useFilterStore } from '@/store/useFilterStore'
import { api } from '@/lib/axios'

// 필터 조건을 queryKey에 넣어 자동 재조회 연동
export const useProducts = () => {
  const filters = useFilterStore(
    useShallow((s) => ({
      category: s.category,
      sortBy: s.sortBy,
      minPrice: s.minPrice,
      maxPrice: s.maxPrice,
    }))
  )

  return useQuery({
    queryKey: ['products', filters],  // filters가 바뀌면 자동 재조회 ✅
    queryFn: async () => {
      const { data } = await api.get('/products', { params: filters })
      return data
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,  // 필터 변경 시 이전 데이터 유지 (깜빡임 방지)
  })
}
```

### 3.3 컴포넌트에서 사용

```tsx
// components/ProductPage.tsx
function ProductPage() {
  const { category, setCategory, sortBy, setSortBy, resetFilters } = useFilterStore()
  const { data: products, isLoading, isFetching } = useProducts()

  return (
    <div>
      {/* 필터 UI → Zustand만 업데이트, TanStack Query 자동 반응 */}
      <div className="filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">전체</option>
          <option value="electronics">전자기기</option>
          <option value="clothing">의류</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="latest">최신순</option>
          <option value="price_asc">가격 낮은순</option>
          <option value="price_desc">가격 높은순</option>
        </select>

        <button onClick={resetFilters}>필터 초기화</button>
      </div>

      {/* 백그라운드 재조회 표시 */}
      {isFetching && <LoadingBar />}

      {isLoading ? (
        <ProductSkeleton />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
```

---

## 4. 실전 예제 3 - 장바구니 + 주문

**역할 분리**:
- Zustand → 장바구니 아이템 (로컬에서 관리 + persist)
- TanStack Query → 주문 생성, 주문 내역 조회

### 4.1 Zustand - 장바구니 스토어

```ts
// store/useCartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  imageUrl: string
}

type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  totalCount: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    immer((set, get) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === newItem.id)
          if (existing) {
            existing.quantity += 1  // immer 덕분에 직접 변경 가능
          } else {
            state.items.push({ ...newItem, quantity: 1 })
          }
        }),

      removeItem: (id) =>
        set((state) => {
          state.items = state.items.filter((i) => i.id !== id)
        }),

      updateQuantity: (id, quantity) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id)
          if (item) {
            if (quantity <= 0) {
              state.items = state.items.filter((i) => i.id !== id)
            } else {
              item.quantity = quantity
            }
          }
        }),

      clearCart: () => set((state) => { state.items = [] }),

      totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    })),
    { name: 'cart' }
  )
)
```

### 4.2 TanStack Query - 주문 생성

```ts
// hooks/useOrder.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCartStore } from '@/store/useCartStore'
import { api } from '@/lib/axios'

// 주문 생성
export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  const clearCart = useCartStore((s) => s.clearCart)
  const items = useCartStore((s) => s.items)

  return useMutation({
    mutationFn: async () => {
      const orderItems = items.map((i) => ({ productId: i.id, quantity: i.quantity }))
      const { data } = await api.post('/orders', { items: orderItems })
      return data
    },
    onSuccess: (order) => {
      clearCart()  // Zustand 장바구니 비우기
      queryClient.invalidateQueries({ queryKey: ['orders'] }) // 주문 내역 캐시 무효화
      queryClient.setQueryData(['orders', order.id], order)   // 방금 만든 주문 즉시 캐싱
    },
  })
}

// 주문 내역 조회
export const useOrders = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders')
      return data
    },
    enabled: isAuthenticated,
  })
}
```

### 4.3 컴포넌트에서 사용

```tsx
// components/CartPage.tsx
function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore()
  const { mutate: createOrder, isPending } = useCreateOrder()
  const navigate = useNavigate()

  const handleOrder = () => {
    createOrder(undefined, {
      onSuccess: (order) => navigate(`/orders/${order.id}`),
    })
  }

  if (items.length === 0) return <EmptyCart />

  return (
    <div>
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onQuantityChange={(qty) => updateQuantity(item.id, qty)}
          onRemove={() => removeItem(item.id)}
        />
      ))}

      <div className="summary">
        <p>총 금액: {totalPrice().toLocaleString()}원</p>
        <button onClick={handleOrder} disabled={isPending}>
          {isPending ? '주문 처리 중...' : '주문하기'}
        </button>
      </div>
    </div>
  )
}

// components/CartIcon.tsx (헤더의 장바구니 아이콘)
function CartIcon() {
  const totalCount = useCartStore((s) => s.totalCount())  // Zustand만으로 충분
  return (
    <Link to="/cart">
      🛒 <span>{totalCount}</span>
    </Link>
  )
}
```

---

## 5. 실전 예제 4 - 무한 스크롤 + 검색

**역할 분리**:
- Zustand → 검색어, 정렬 (UI 상태)
- TanStack Query → 검색 결과 페이지네이션

### 5.1 Zustand - 검색 스토어

```ts
// store/useSearchStore.ts
import { create } from 'zustand'

type SearchStore = {
  keyword: string
  sortBy: 'relevance' | 'latest'
  setKeyword: (keyword: string) => void
  setSortBy: (sortBy: SearchStore['sortBy']) => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  keyword: '',
  sortBy: 'relevance',
  setKeyword: (keyword) => set({ keyword }),
  setSortBy: (sortBy) => set({ sortBy }),
}))
```

### 5.2 TanStack Query - 무한 스크롤 검색

```ts
// hooks/useSearchPosts.ts
import { useInfiniteQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { useSearchStore } from '@/store/useSearchStore'
import { api } from '@/lib/axios'

export const useSearchPosts = () => {
  const { keyword, sortBy } = useSearchStore(
    useShallow((s) => ({ keyword: s.keyword, sortBy: s.sortBy }))
  )

  return useInfiniteQuery({
    queryKey: ['posts', 'search', { keyword, sortBy }], // 검색어 바뀌면 처음부터 재조회
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get('/posts/search', {
        params: { keyword, sortBy, page: pageParam, limit: 15 },
      })
      return data // { posts: [], nextPage: 2, hasNextPage: true }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextPage : undefined,
    enabled: keyword.length >= 2, // 2글자 이상일 때만 검색
    staleTime: 1000 * 30,
  })
}
```

### 5.3 컴포넌트에서 사용

```tsx
// components/SearchPage.tsx
import { useRef, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'

function SearchPage() {
  const { keyword, setKeyword, sortBy, setSortBy } = useSearchStore()
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSearchPosts()

  // debounce 적용 (입력 후 400ms 뒤에 Zustand 업데이트 → 쿼리 실행)
  const handleSearch = useDebouncedCallback(
    (value: string) => setKeyword(value),
    400
  )

  // IntersectionObserver로 무한 스크롤
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage) fetchNextPage() },
      { threshold: 0.5 }
    )
    if (bottomRef.current) observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  const posts = data?.pages.flatMap((p) => p.posts) ?? []

  return (
    <div>
      <input
        placeholder="검색어 입력 (2글자 이상)"
        defaultValue={keyword}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
        <option value="relevance">관련도순</option>
        <option value="latest">최신순</option>
      </select>

      {keyword.length < 2 && <p>2글자 이상 입력해주세요.</p>}
      {isLoading && <Skeleton count={5} />}

      <div className="post-list">
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>

      <div ref={bottomRef} className="h-10">
        {isFetchingNextPage && <Spinner />}
      </div>
    </div>
  )
}
```

---

## 6. 실전 예제 5 - 좋아요 Optimistic Update

**역할 분리**:
- Zustand → 없음 (서버 상태이므로 TanStack Query가 전담)
- TanStack Query → 좋아요 상태, Optimistic Update + 롤백

```ts
// hooks/useToggleLike.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

type Post = { id: number; liked: boolean; likeCount: number }

export const useToggleLike = (postId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post(`/posts/${postId}/like`),

    onMutate: async () => {
      // 진행 중인 refetch 취소 (충돌 방지)
      await queryClient.cancelQueries({ queryKey: ['post', postId] })

      // 롤백을 위해 현재 상태 저장
      const previousPost = queryClient.getQueryData<Post>(['post', postId])

      // UI 먼저 업데이트
      queryClient.setQueryData<Post>(['post', postId], (old) => {
        if (!old) return old
        return {
          ...old,
          liked: !old.liked,
          likeCount: old.liked ? old.likeCount - 1 : old.likeCount + 1,
        }
      })

      // 목록 캐시도 같이 업데이트
      queryClient.setQueriesData<{ posts: Post[] }>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            posts: old.posts.map((p) =>
              p.id === postId
                ? { ...p, liked: !p.liked, likeCount: p.liked ? p.likeCount - 1 : p.likeCount + 1 }
                : p
            ),
          }
        }
      )

      return { previousPost }
    },

    onError: (_err, _vars, context) => {
      // 실패 시 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost)
      }
    },

    onSettled: () => {
      // 최종 서버 상태로 동기화
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })
}
```

```tsx
// components/LikeButton.tsx
function LikeButton({ post }: { post: Post }) {
  const { mutate: toggleLike, isPending } = useToggleLike(post.id)

  return (
    <button
      onClick={() => toggleLike()}
      disabled={isPending}
      className={post.liked ? 'liked' : ''}
    >
      {post.liked ? '♥' : '♡'} {post.likeCount}
    </button>
  )
}
```

---

## 7. 실전 예제 6 - 알림 실시간 폴링

**역할 분리**:
- Zustand → 알림 패널 열림/닫힘 (UI 상태)
- TanStack Query → 알림 목록, 읽음 처리 (서버 상태)

### 7.1 Zustand - 알림 UI 상태

```ts
// store/useNotificationStore.ts
import { create } from 'zustand'

type NotificationStore = {
  isOpen: boolean
  togglePanel: () => void
  closePanel: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  isOpen: false,
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  closePanel: () => set({ isOpen: false }),
}))
```

### 7.2 TanStack Query - 알림 조회 + 폴링

```ts
// hooks/useNotifications.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { api } from '@/lib/axios'

export const useNotifications = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications')
      return data // { items: [], unreadCount: 3 }
    },
    enabled: isAuthenticated,
    staleTime: 0,
    refetchInterval: 30_000,          // 30초마다 폴링
    refetchIntervalInBackground: false, // 탭이 백그라운드일 때는 폴링 중단
  })
}

// 전체 읽음 처리
export const useMarkAllRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.setQueryData(['notifications'], (old: any) => ({
        ...old,
        items: old.items.map((n: any) => ({ ...n, read: true })),
        unreadCount: 0,
      }))
    },
  })
}
```

### 7.3 컴포넌트에서 사용

```tsx
// components/NotificationBell.tsx
function NotificationBell() {
  const { isOpen, togglePanel, closePanel } = useNotificationStore()
  const { data } = useNotifications()
  const { mutate: markAllRead } = useMarkAllRead()

  return (
    <div className="relative">
      <button onClick={togglePanel}>
        🔔
        {(data?.unreadCount ?? 0) > 0 && (
          <span className="badge">{data?.unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="panel-header">
            <h3>알림</h3>
            <button onClick={() => { markAllRead(); closePanel() }}>
              모두 읽음
            </button>
          </div>

          {data?.items.map((notif: any) => (
            <NotificationItem
              key={notif.id}
              notif={notif}
              onClose={closePanel}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 8. 패턴 정리 및 폴더 구조

### 8.1 권장 폴더 구조

```
src/
├── store/                      # Zustand (클라이언트 상태)
│   ├── useAuthStore.ts         # 인증 토큰
│   ├── useCartStore.ts         # 장바구니
│   ├── useFilterStore.ts       # 필터/정렬 조건
│   ├── useSearchStore.ts       # 검색어
│   └── useNotificationStore.ts # 알림 패널 UI 상태
│
├── hooks/                      # TanStack Query (서버 상태)
│   ├── useProfile.ts           # 유저 프로필
│   ├── useLogin.ts             # 로그인 뮤테이션
│   ├── useLogout.ts            # 로그아웃 뮤테이션
│   ├── useProducts.ts          # 상품 목록 (필터 연동)
│   ├── useOrder.ts             # 주문 생성/조회
│   ├── useSearchPosts.ts       # 무한 스크롤 검색
│   ├── useToggleLike.ts        # 좋아요 Optimistic
│   └── useNotifications.ts    # 알림 폴링
│
├── lib/
│   └── axios.ts                # API 클라이언트 (Zustand 토큰 연동)
│
└── queryKeys.ts                # 쿼리 키 상수 관리
```

### 8.2 두 라이브러리 연동 패턴 요약

```
패턴 1: Zustand 상태 → TanStack Query enabled 제어
─────────────────────────────────────────────────
const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
useQuery({ enabled: isAuthenticated, ... })


패턴 2: Zustand 상태 → TanStack Query queryKey 연동 (자동 재조회)
─────────────────────────────────────────────────
const filters = useFilterStore(useShallow(...))
useQuery({ queryKey: ['products', filters], ... })
// filters 변경 시 자동으로 새 쿼리 실행


패턴 3: TanStack Query 성공 시 → Zustand 상태 업데이트
─────────────────────────────────────────────────
useMutation({
  onSuccess: ({ token }) => {
    setToken(token)  // Zustand 업데이트
  }
})


패턴 4: TanStack Query 성공 시 → Zustand 상태 초기화
─────────────────────────────────────────────────
useMutation({
  onSuccess: () => {
    clearCart()         // Zustand 초기화
    queryClient.clear() // TanStack Query 캐시 삭제
  }
})


패턴 5: Zustand로 컴포넌트 외부에서 서버 상태에 접근
─────────────────────────────────────────────────
// axios 인터셉터 등 컴포넌트 밖에서
const token = useAuthStore.getState().token
```

### 8.3 무엇을 어디에 넣을지 판단 기준

```
이 데이터가 어디서 오는가?
│
├── 서버 (API 응답)
│   └── → TanStack Query
│       예: 유저 목록, 게시글, 주문 내역, 알림
│
└── 클라이언트 (앱 내부에서 생성/관리)
    │
    ├── 새로고침 후에도 유지?
    │   ├── YES → Zustand + persist
    │   │         예: 장바구니, 테마, 토큰
    │   └── NO  → Zustand (또는 useState)
    │             예: 필터 조건, 모달 상태, 검색어
    │
    └── 여러 컴포넌트에서 공유?
        ├── YES → Zustand
        └── NO  → useState
```

---

## 정리

| 상황 | 사용 도구 | 핵심 포인트 |
|------|-----------|------------|
| 로그인 토큰 저장 | Zustand + persist | 새로고침 후에도 유지 |
| 유저 프로필 조회 | TanStack Query | `enabled: isAuthenticated` |
| 필터 조건 | Zustand | queryKey에 넣어 자동 재조회 연동 |
| 상품 목록 | TanStack Query | `queryKey: ['products', filters]` |
| 장바구니 | Zustand + persist + immer | 로컬 관리, 주문 시 clearCart |
| 주문 생성 | TanStack Query useMutation | 성공 시 clearCart + invalidate |
| 검색어 | Zustand | debounce 적용 후 queryKey 연동 |
| 무한 스크롤 | TanStack Query useInfiniteQuery | 검색 조건 변경 시 처음부터 재조회 |
| 좋아요 | TanStack Query + Optimistic | onMutate/onError/onSettled |
| 알림 패널 열림 | Zustand | 순수 UI 상태 |
| 알림 목록 | TanStack Query + 폴링 | `refetchInterval: 30000` |
| axios 토큰 주입 | Zustand.getState() | 컴포넌트 외부에서 접근 |

> **핵심**: 두 라이브러리는 경쟁이 아닌 **보완** 관계입니다.
> Zustand로 클라이언트 상태를 깔끔하게 관리하고, TanStack Query로 서버와의 동기화를 자동화하면
> 코드 양은 줄어들고 UX는 더 좋아집니다.
