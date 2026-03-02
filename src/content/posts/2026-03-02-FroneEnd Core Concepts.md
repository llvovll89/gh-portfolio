---
title: Frontend Core Concepts
date: 2026-03-02
summary: Frontend Core Concepts를 정리한 글 입니다.
tags: [Frontend, react, js, hooks]
---

# Frontend Core Concepts

> 작성일: 2026-03-02 | React 19 기준

---

## 목차

1. [JS 실행 원리](#1-js-실행-원리)
2. [React 설계](#2-react-설계)
3. [Hooks 활용](#3-hooks-활용)
4. [렌더링 전략](#4-렌더링-전략)
5. [성능 진단](#5-성능-진단)
6. [UX](#6-ux)

---

## 1. JS 실행 원리

### 이벤트 루프 (Event Loop)

```
┌─────────────┐
│  Call Stack │ ← 동기 코드 실행 (LIFO)
└──────┬──────┘
       │ 비어있을 때
       ▼
┌─────────────────────────────┐
│  Microtask Queue (우선)      │ ← Promise.then, queueMicrotask, MutationObserver
│  Task Queue (Macrotask)     │ ← setTimeout, setInterval, I/O, MessageChannel
└─────────────────────────────┘
```

**실행 순서:**

1. Call Stack 실행
2. Call Stack이 비면 → Microtask Queue 전부 소진
3. 브라우저 렌더링 (필요 시)
4. Task Queue에서 태스크 1개 꺼내 실행
5. 2번으로 반복

```js
console.log('1')                          // 동기
setTimeout(() => console.log('2'), 0)     // Task Queue
Promise.resolve().then(() => console.log('3')) // Microtask
queueMicrotask(() => console.log('4'))    // Microtask
console.log('5')                          // 동기

// 출력 순서: 1 → 5 → 3 → 4 → 2
```

### 실행 컨텍스트 (Execution Context)

- **Global EC** → 함수 호출 시 **Function EC** 생성 → 완료 시 Stack에서 제거
- 각 EC는 세 가지 구성 요소를 가짐:
  - `LexicalEnvironment`: `let`, `const`, 함수 선언 바인딩
  - `VariableEnvironment`: `var` 바인딩
  - `ThisBinding`: 호출 방식에 따라 결정

**호이스팅 비교:**

```js
console.log(a) // undefined  (var: 선언만 끌어올림)
console.log(b) // ReferenceError (let: TDZ — Temporal Dead Zone)
console.log(fn) // function fn() {...}  (함수 선언식: 전체 끌어올림)

var a = 1
let b = 2
function fn() {}
```

**TDZ (Temporal Dead Zone):** `let`, `const`는 선언 전 접근 시 ReferenceError 발생. 선언은 끌어올려지지만 초기화 이전까지 접근 불가.

### 스코프 (Scope)

```js
// 렉시컬 스코프: 함수 정의 위치 기준으로 스코프 결정
const x = 'global'

function outer() {
  const x = 'outer'
  function inner() {
    console.log(x) // 'outer' — 정의된 위치의 스코프 참조
  }
  inner()
}
```

| 스코프 종류 | 설명 |
|------------|------|
| 전역 스코프 | 어디서든 접근 가능 |
| 함수 스코프 | `var`, 함수 내부 |
| 블록 스코프 | `let`, `const` — `{}` 기준 |
| 모듈 스코프 | ES Module은 파일 단위 독립 스코프 |

### 클로저 (Closure)

함수가 **선언된 시점의 렉시컬 환경을 기억**하는 함수

```js
function makeCounter() {
  let count = 0 // 클로저가 캡처하는 변수
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  }
}

const counter = makeCounter()
counter.increment() // 1
counter.increment() // 2
counter.getCount()  // 2
```

**실전 활용:**

```js
// 메모이제이션
function memoize(fn) {
  const cache = new Map()
  return function (...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

// 부분 적용 (Partial Application)
const multiply = (a) => (b) => a * b
const double = multiply(2)
double(5) // 10
```

**주의:** 클로저가 외부 변수를 참조하면 GC가 수집하지 못함 → 명시적 해제 필요

### 비동기 처리 패턴

```js
// 1. Promise 체이닝
fetch('/api/user')
  .then(res => res.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(res => res.json())
  .catch(err => console.error(err))

// 2. async/await (가독성 향상)
async function loadUserPosts(userId) {
  try {
    const res = await fetch(`/api/users/${userId}`)
    const user = await res.json()
    const posts = await fetch(`/api/posts?userId=${user.id}`)
    return posts.json()
  } catch (err) {
    throw new Error(`Failed to load: ${err.message}`)
  }
}

// 3. 병렬 처리 — 독립적인 비동기 작업은 병렬로
const [user, settings] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/settings').then(r => r.json()),
])

// 4. 첫 번째 성공만
const result = await Promise.any([mirror1, mirror2, mirror3])

// 5. 모두 완료 (실패 포함)
const results = await Promise.allSettled([req1, req2, req3])
results.forEach(r => {
  if (r.status === 'fulfilled') console.log(r.value)
  else console.error(r.reason)
})
```

### 프로토타입 체인

```js
function Animal(name) { this.name = name }
Animal.prototype.speak = function () { return `${this.name} speaks` }

const dog = new Animal('Rex')
dog.speak()           // 'Rex speaks' (프로토타입에서 탐색)
dog.hasOwnProperty('name')  // true
dog.hasOwnProperty('speak') // false (프로토타입에 있음)

// 탐색 경로
// dog → Animal.prototype → Object.prototype → null
```

**ES6 Class (문법적 설탕):**

```js
class Animal {
  #name // private 필드 (ES2022)

  constructor(name) { this.#name = name }
  speak() { return `${this.#name} speaks` }

  static create(name) { return new Animal(name) } // 정적 메서드
}

class Dog extends Animal {
  bark() { return `${super.speak()} and barks` }
}
```

### 가비지 컬렉션 & 메모리

- **Mark-and-Sweep**: GC 루트(전역, 스택)에서 도달 불가한 객체 수집
- **메모리 누수 주요 원인:**
  - 전역 변수에 쌓이는 데이터
  - 제거된 DOM 노드를 참조하는 이벤트 리스너
  - 정리되지 않은 `setInterval`
  - 클로저로 캡처된 대용량 객체

```js
// 누수 예시
const button = document.getElementById('btn')
button.addEventListener('click', heavyHandler)
button.remove() // DOM 제거해도 heavyHandler가 button 참조 유지

// 해결: 이벤트 리스너 명시적 제거
button.removeEventListener('click', heavyHandler)
```

---

## 2. React 설계

### 컴포넌트 설계 원칙

| 원칙 | 설명 | 예시 |
|------|------|------|
| 단일 책임 | 하나의 컴포넌트는 하나의 역할 | `UserAvatar`, `UserName` 분리 |
| 최소 상태 | 필요한 곳에만 state 위치 | 파생값은 state 대신 계산 |
| 단방향 흐름 | props는 부모→자식, 역방향은 콜백 | `onChange`, `onSubmit` 전달 |
| 관심사 분리 | UI / 비즈니스 로직 / 데이터 레이어 | 커스텀 훅으로 로직 추출 |
| 제어 역전 | 부모가 동작 결정, 자식은 UI 담당 | `renderItem`, `children` prop |

### 파생 상태 vs 실제 상태

```js
// BAD: 파생값을 state로 관리
const [items, setItems] = useState([])
const [count, setCount] = useState(0) // items.length와 동기화 문제 발생

// GOOD: 렌더 시점에 계산
const [items, setItems] = useState([])
const count = items.length // 항상 일치 보장
```

### 상태 관리 위치 결정 트리

```
이 상태를 다른 컴포넌트와 공유해야 하나?
├── NO  → useState / useReducer (로컬)
└── YES
    ├── 같은 서브트리? → Props drilling or Context
    ├── 앱 전체 UI 상태? → Zustand / Jotai
    ├── 서버 데이터? → TanStack Query / SWR
    └── URL에 반영해야? → useSearchParams
```

### 컴포넌트 합성 패턴

```jsx
// 1. Compound Component (복합 컴포넌트)
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
</Tabs>

// 2. Render Props
<DataFetcher url="/api/users">
  {({ data, loading, error }) => (
    loading ? <Spinner /> : <UserList users={data} />
  )}
</DataFetcher>

// 3. 제어 컴포넌트 vs 비제어 컴포넌트
// 제어: React가 상태 관리
<input value={value} onChange={e => setValue(e.target.value)} />

// 비제어: DOM이 상태 관리 (ref로 접근)
<input ref={inputRef} defaultValue="initial" />
```

### 폴더 구조

**Feature-based (도메인 중심):**

```
src/
├── app/                  # 라우팅, 레이아웃 (Next.js App Router)
├── features/
│   ├── auth/
│   │   ├── components/   # AuthForm, LoginButton
│   │   ├── hooks/        # useAuth, useSession
│   │   ├── api/          # auth.api.ts
│   │   └── store/        # authStore.ts
│   └── products/
│       ├── components/
│       ├── hooks/
│       └── api/
├── shared/
│   ├── components/       # Button, Modal, Input (재사용 UI)
│   ├── hooks/            # useDebounce, useIntersection
│   ├── lib/              # axios instance, date utils
│   └── types/            # 공통 타입 정의
└── styles/
```

### Error Boundary

```jsx
// 클래스 컴포넌트로만 구현 가능 (또는 react-error-boundary 라이브러리)
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>오류가 발생했습니다: {error.message}</p>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  )
}

<ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => refetch()}>
  <UserProfile />
</ErrorBoundary>
```

---

## 3. Hooks 활용

> React 19 기준. 최신 문법 위주로 정리.

---

### 기본 State 훅

#### `useState`

```js
const [state, setState] = useState(initialValue)

// 초기값이 계산 비용이 크다면 → 지연 초기화 (lazy initializer)
const [data, setData] = useState(() => JSON.parse(localStorage.getItem('data') ?? '[]'))

// 함수형 업데이트: 최신 state 보장
setState(prev => [...prev, newItem])

// 객체 state 업데이트: 불변성 유지
setState(prev => ({ ...prev, name: 'Alice' }))
```

#### `useReducer`

복잡한 상태 로직, 여러 sub-state가 연관될 때 `useState` 대신 사용

```js
const initialState = { count: 0, step: 1 }

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT': return { ...state, count: state.count + state.step }
    case 'DECREMENT': return { ...state, count: state.count - state.step }
    case 'SET_STEP':  return { ...state, step: action.payload }
    case 'RESET':     return initialState
    default: throw new Error(`Unknown action: ${action.type}`)
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'SET_STEP', payload: 5 })}>Step 5</button>
    </>
  )
}
```

---

### 참조 & 메모이제이션

#### `useRef`

```js
// 1. DOM 참조
const inputRef = useRef(null)
<input ref={inputRef} />
inputRef.current.focus()

// 2. 렌더 간 값 유지 (리렌더 없음)
const timerRef = useRef(null)
timerRef.current = setTimeout(callback, 1000)

// 3. 이전 값 추적
function usePrevious(value) {
  const ref = useRef(undefined)
  useEffect(() => { ref.current = value })
  return ref.current // 이전 렌더의 값 반환
}

// 4. Callback Ref (DOM 요소 마운트 감지)
const measuredRef = useCallback(node => {
  if (node) console.log('Height:', node.getBoundingClientRect().height)
}, [])
<div ref={measuredRef} />
```

#### `useMemo` / `useCallback`

```js
// useMemo: 값 메모이제이션
const filteredItems = useMemo(
  () => items.filter(item => item.active && item.name.includes(query)),
  [items, query]
)

// useCallback: 함수 메모이제이션 (자식에게 prop으로 전달 시 유용)
const handleSubmit = useCallback(
  async (data) => {
    await submitForm(data)
    onSuccess()
  },
  [onSuccess] // onSuccess가 바뀔 때만 재생성
)
```

> **언제 써야 하나?**
>
> - `useMemo`: 계산 비용이 클 때, 참조 동일성이 중요할 때 (의존성 배열로 쓰이는 객체/배열)
> - `useCallback`: `React.memo`로 감싼 자식 컴포넌트에 함수를 prop으로 전달할 때
> - 남발하면 오히려 비교 비용 증가 — React 19의 React Compiler가 자동 최적화 가능

---

### Effect 훅

#### `useEffect`

```js
useEffect(() => {
  const controller = new AbortController()

  async function fetchData() {
    try {
      const res = await fetch('/api/data', { signal: controller.signal })
      const json = await res.json()
      setData(json)
    } catch (err) {
      if (err.name !== 'AbortError') setError(err)
    }
  }

  fetchData()
  return () => controller.abort() // cleanup: 언마운트 또는 deps 변경 시
}, []) // [] = 마운트 시 1회
```

**의존성 배열 규칙:**

```js
useEffect(() => { ... })           // 매 렌더마다 실행 (거의 안 씀)
useEffect(() => { ... }, [])       // 마운트 시 1회
useEffect(() => { ... }, [a, b])   // a 또는 b 변경 시 실행
```

#### `useLayoutEffect`

- DOM 변경 후, **브라우저 페인트 전에** 동기 실행
- 깜빡임(FOUC) 방지가 필요한 DOM 측정/조작에 사용
- SSR에서 사용 불가 → `useEffect`로 폴백 필요

```js
useLayoutEffect(() => {
  // DOM 크기/위치 측정 후 즉시 스타일 적용
  const rect = ref.current.getBoundingClientRect()
  setTooltipPosition({ top: rect.bottom, left: rect.left })
}, [isOpen])
```

#### `useInsertionEffect` (React 18+)

- CSS-in-JS 라이브러리 전용. DOM 변경 전, 가장 먼저 실행
- 스타일 주입에만 사용. 일반 개발에서는 사용 X

---

### Context

#### `useContext`

```js
// 1. Context 생성 + 기본값
const ThemeContext = createContext({ theme: 'light', toggle: () => {} })

// 2. Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const toggle = useCallback(() =>
    setTheme(t => t === 'light' ? 'dark' : 'light'), [])

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle])

  return <ThemeContext value={value}>{children}</ThemeContext>
  // React 19: <Context value={...}> 직접 사용 (Provider 불필요)
}

// 3. 소비
function ThemeButton() {
  const { theme, toggle } = useContext(ThemeContext)
  return <button onClick={toggle}>현재: {theme}</button>
}
```

**Context 리렌더 최적화:**

```js
// Context를 분리해 관련 없는 리렌더 방지
const UserDataContext = createContext(null)    // 자주 안 바뀜
const UserActionsContext = createContext(null) // 함수만 (안 바뀜)
```

---

### Concurrent 훅 (React 18+)

#### `useTransition`

긴급하지 않은 상태 업데이트를 낮은 우선순위로 처리

```js
function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  function handleChange(e) {
    setQuery(e.target.value) // 즉각 반영 (urgent)
    startTransition(() => {
      setResults(searchItems(e.target.value)) // 낮은 우선순위
    })
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <ResultList items={results} />
    </>
  )
}
```

#### `useDeferredValue`

값의 업데이트를 지연시켜 UI 응답성 유지. props로 받은 값에 활용

```js
function ProductList({ items }) {
  const deferredItems = useDeferredValue(items)
  const isStale = items !== deferredItems // 지연 중인지 확인

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      {deferredItems.map(item => <ProductCard key={item.id} item={item} />)}
    </div>
  )
}
```

> `useTransition`: **상태 업데이트**를 지연 (원인 제어)
> `useDeferredValue`: **값**을 지연 (외부에서 받은 prop에 사용)

---

### ID & 외부 스토어

#### `useId` (React 18+)

서버/클라이언트 간 안정적인 고유 ID 생성 (SSR Hydration 일치 보장)

```jsx
function FormField({ label }) {
  const id = useId()
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  )
}

// 여러 개 필요할 때 prefix 사용
function PasswordField() {
  const id = useId()
  return (
    <>
      <input id={`${id}-input`} type="password" />
      <div id={`${id}-hint`}>8자 이상 입력하세요</div>
    </>
  )
}
```

#### `useSyncExternalStore` (React 18+)

외부 스토어(Zustand, Redux, 브라우저 API 등)를 Concurrent Mode에서 안전하게 구독

```js
// 브라우저 온라인 상태 구독 예시
function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback)
      window.addEventListener('offline', callback)
      return () => {
        window.removeEventListener('online', callback)
        window.removeEventListener('offline', callback)
      }
    },
    () => navigator.onLine,       // 클라이언트 스냅샷
    () => true                    // 서버 스냅샷 (SSR)
  )
}

function NetworkBadge() {
  const isOnline = useOnlineStatus()
  return <span>{isOnline ? '온라인' : '오프라인'}</span>
}
```

---

### React 19 신규 훅

#### `use()` — Promise & Context 읽기

```jsx
// 1. Promise 읽기 (Suspense와 함께)
function UserProfile({ userPromise }) {
  const user = use(userPromise) // Promise가 resolve될 때까지 Suspense
  return <h1>{user.name}</h1>
}

// 2. Context 읽기 (useContext와 동일하지만 조건부 사용 가능)
function Button({ variant }) {
  if (variant === 'icon') return <IconButton />

  const theme = use(ThemeContext) // 조건문 안에서도 사용 가능
  return <button style={{ background: theme.primary }}>Click</button>
}
```

#### `useActionState` (구 `useFormState`)

폼 액션과 상태를 통합 관리

```jsx
async function submitAction(prevState, formData) {
  const name = formData.get('name')
  if (!name) return { error: '이름을 입력하세요', success: false }

  await saveUser({ name })
  return { error: null, success: true }
}

function UserForm() {
  const [state, formAction, isPending] = useActionState(submitAction, {
    error: null,
    success: false,
  })

  return (
    <form action={formAction}>
      <input name="name" disabled={isPending} />
      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
      {state.success && <p style={{ color: 'green' }}>저장 완료!</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}
```

#### `useFormStatus`

폼 제출 상태를 자식 컴포넌트에서 접근 (부모 `<form>` 내부에서만 동작)

```jsx
function SubmitButton() {
  const { pending, data, method } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? '제출 중...' : '제출'}
    </button>
  )
}

function MyForm() {
  return (
    <form action={serverAction}>
      <input name="email" type="email" />
      <SubmitButton /> {/* 부모 form의 상태 자동 구독 */}
    </form>
  )
}
```

#### `useOptimistic`

서버 응답 전에 UI를 미리 낙관적으로 업데이트

```jsx
function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (currentTodos, newTodo) => [...currentTodos, { ...newTodo, pending: true }]
  )

  async function formAction(formData) {
    const title = formData.get('title')
    addOptimistic({ id: Date.now(), title }) // 즉시 UI 반영
    await addTodo({ title })                 // 서버 요청 (완료되면 실제 데이터로 교체)
  }

  return (
    <>
      {optimisticTodos.map(todo => (
        <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
          {todo.title}
        </li>
      ))}
      <form action={formAction}>
        <input name="title" />
        <button type="submit">추가</button>
      </form>
    </>
  )
}
```

---

### 커스텀 훅 패턴

```js
// 1. 데이터 페칭 훅
function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  useEffect(() => {
    const controller = new AbortController()
    setState(prev => ({ ...prev, loading: true }))

    fetch(url, { signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error(res.statusText); return res.json() })
      .then(data => setState({ data, loading: false, error: null }))
      .catch(err => {
        if (err.name !== 'AbortError')
          setState({ data: null, loading: false, error: err })
      })

    return () => controller.abort()
  }, [url])

  return state
}

// 2. 디바운스 훅
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// 3. 로컬스토리지 동기화 훅
function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    const toStore = value instanceof Function ? value(stored) : value
    setStored(toStore)
    localStorage.setItem(key, JSON.stringify(toStore))
  }, [key, stored])

  return [stored, setValue]
}

// 4. 인터섹션 옵저버 훅 (무한 스크롤, 애니메이션 트리거)
function useIntersection(ref, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, options])

  return isIntersecting
}
```

**커스텀 훅 설계 원칙:**

- `use` 접두어 필수
- 단일 관심사 유지
- 반환값: 배열(튜플) 또는 객체 중 일관성 있게 선택
- 내부 상태를 캡슐화해 사용처 코드 단순화

---

## 4. 렌더링 전략

### 브라우저 렌더링 파이프라인

```
HTML 파싱 → DOM 트리
CSS 파싱  → CSSOM 트리
            ↓
        Render Tree (표시 요소만)
            ↓
        Layout (위치/크기 계산)
            ↓
        Paint (픽셀 그리기)
            ↓
        Composite (레이어 합성)
```

**Reflow vs Repaint:**

| 작업 | 트리거 | 비용 |
|------|--------|------|
| Reflow (Layout) | width, height, margin, position 변경 | 매우 높음 |
| Repaint | color, background, visibility 변경 | 중간 |
| Composite만 | transform, opacity 변경 | 낮음 (GPU 가속) |

```css
/* BAD: Reflow 유발 */
.box { width: 100px; left: 50px; }

/* GOOD: Composite만 사용 */
.box { transform: translateX(50px); }
```

### CSR / SSR / SSG / ISR / PPR 비교

| 방식 | 렌더 시점 | TTFB | SEO | 적합 사례 |
|------|-----------|------|-----|-----------|
| **CSR** | 브라우저 | 빠름 | 취약 | 대시보드, 인증 페이지 |
| **SSR** | 요청마다 서버 | 보통 | 우수 | 실시간 데이터, 개인화 콘텐츠 |
| **SSG** | 빌드 타임 | 매우 빠름 | 우수 | 블로그, 마케팅 |
| **ISR** | 빌드 + 주기적 갱신 | 빠름 | 우수 | 준실시간 콘텐츠 |
| **PPR** | 정적 Shell + 동적 스트리밍 | 매우 빠름 | 우수 | Next.js 최신 패턴 |

### React Server Components (RSC)

```jsx
// Server Component (기본): 서버에서만 실행, 번들에 포함 안 됨
// app/page.tsx
async function ProductPage({ params }) {
  const product = await db.product.findUnique({ where: { id: params.id } })
  // DB 직접 접근, API Key 노출 없음, 번들 크기 0

  return (
    <main>
      <ProductInfo product={product} />
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={params.id} />  {/* 별도 스트리밍 */}
      </Suspense>
    </main>
  )
}

// Client Component: 'use client' 지시어 필요
'use client'
function AddToCartButton({ productId }) {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>담기 ({count})</button>
}
```

**RSC 선택 가이드:**

```
Server Component → 데이터 페칭, DB 접근, 큰 의존성 (마크다운 파서 등)
Client Component → useState/useEffect, 이벤트 핸들러, 브라우저 API
```

### React 렌더 최적화

```jsx
// 1. React.memo: props 변경 없으면 리렌더 스킵
const ProductCard = memo(function ProductCard({ product }) {
  return <div>{product.name}</div>
}, (prevProps, nextProps) => prevProps.product.id === nextProps.product.id)
// 두 번째 인자: 커스텀 비교 함수 (true = 같음 = 리렌더 스킵)

// 2. key 관리: 안정적인 고유값 사용
// BAD: index는 재정렬 시 불필요한 리마운트
{items.map((item, i) => <Item key={i} {...item} />)}

// GOOD: 안정적 ID
{items.map(item => <Item key={item.id} {...item} />)}

// 3. 상태 하강 (State Colocation): 자주 바뀌는 상태를 작은 컴포넌트로 격리
function ExpensiveParent() {
  // BAD: count 바뀔 때마다 ExpensiveChild 리렌더
  const [count, setCount] = useState(0)
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <ExpensiveChild />
    </>
  )
}

// GOOD: Counter를 별도 컴포넌트로 분리
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Streaming & Suspense

```jsx
// 스트리밍 SSR: 준비된 컴포넌트부터 순차 전송
export default function DashboardPage() {
  return (
    <main>
      <Header />                              {/* 즉시 전송 */}

      <Suspense fallback={<StatsSkeleton />}>
        <StatsWidget />                       {/* 데이터 준비되면 스트리밍 */}
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </main>
  )
}
```

---

## 5. 성능 진단

### Core Web Vitals (2025 기준)

| 지표 | 좋음 | 개선 필요 | 의미 |
|------|------|-----------|------|
| **LCP** | ≤ 2.5s | > 4.0s | 최대 콘텐츠 요소 렌더 시간 |
| **INP** | ≤ 200ms | > 500ms | 전체 인터랙션 응답 지연 (FID 대체) |
| **CLS** | ≤ 0.1 | > 0.25 | 예기치 않은 레이아웃 이동 |
| **TTFB** | ≤ 800ms | > 1.8s | 첫 바이트 수신까지 시간 |
| **FCP** | ≤ 1.8s | > 3.0s | 첫 콘텐츠 표시 시간 |

### 진단 도구

```
Chrome DevTools
├── Performance 탭  → 렌더 타임라인, Long Task (50ms↑), Layout Shift 탐지
├── Memory 탭       → Heap Snapshot, 메모리 누수 탐지
├── Network 탭      → 리소스 크기, 요청 폭포수, 캐시 히트율
└── Coverage 탭     → 사용되지 않는 JS/CSS 탐지

React DevTools
├── Profiler        → 컴포넌트별 렌더 시간, 리렌더 원인(why-did-it-render)
└── Components      → props/state/hooks 실시간 확인

외부 도구
├── Lighthouse      → CWV 종합 점수 및 개선 제안
├── WebPageTest     → 실제 네트워크/디바이스 환경 테스트
└── Sentry          → 프로덕션 성능 모니터링 (Web Vitals 수집)
```

### 번들 최적화

```js
// 1. 코드 스플리팅 + Suspense
const HeavyChart = lazy(() => import('./HeavyChart'))
const AdminPage  = lazy(() => import('./AdminPage'))

<Suspense fallback={<ChartSkeleton />}>
  <HeavyChart />
</Suspense>

// 2. 라우트별 스플리팅 (Next.js는 자동)
const router = createBrowserRouter([
  {
    path: '/dashboard',
    lazy: async () => ({ Component: (await import('./DashboardPage')).default }),
  }
])

// 3. 동적 import (조건부 로딩)
async function loadMarkdownParser() {
  const { marked } = await import('marked') // 필요 시점에만 로드
  return marked
}
```

**번들 분석:**

```bash
# webpack-bundle-analyzer
npx next build && npx @next/bundle-analyzer

# vite-plugin-visualizer
vite build --mode analyze
```

### 이미지 최적화

```html
<!-- 1. 형식: WebP/AVIF 우선 -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="설명" width="800" height="600">
</picture>

<!-- 2. 반응형 이미지 -->
<img
  src="image-800.webp"
  srcset="image-400.webp 400w, image-800.webp 800w, image-1200.webp 1200w"
  sizes="(max-width: 600px) 100vw, 50vw"
  loading="lazy"
  decoding="async"
  alt="설명"
>
```

```jsx
// Next.js Image 컴포넌트 (최적화 자동화)
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority      // LCP 이미지: 미리 로드
  placeholder="blur"
/>
```

### 렌더링 성능

```jsx
// 1. 가상화 (대량 리스트)
import { FixedSizeList } from 'react-window'

<FixedSizeList height={600} itemCount={10000} itemSize={50} width="100%">
  {({ index, style }) => (
    <div style={style}><ListItem item={items[index]} /></div>
  )}
</FixedSizeList>

// 2. Web Worker (CPU 집약적 작업 오프로드)
const worker = new Worker(new URL('./heavyCalc.worker.js', import.meta.url))
worker.postMessage({ data: largeDataset })
worker.onmessage = ({ data }) => setResult(data)

// 3. requestIdleCallback (유휴 시간 활용)
requestIdleCallback(() => {
  prefetchNextPage()      // 급하지 않은 작업
  logAnalytics()
}, { timeout: 2000 })
```

### 네트워크 최적화

```html
<!-- 리소스 힌트 -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="prefetch" href="/next-page.js">          <!-- 다음 페이지 사전 로드 -->
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">
```

```js
// HTTP 캐싱 전략 (Next.js)
fetch('/api/static-data', {
  next: { revalidate: 3600 } // 1시간 캐시
})

fetch('/api/user-data', {
  cache: 'no-store'           // 항상 최신
})
```

---

## 6. UX

### 핵심 원칙 (Jakob Nielsen의 휴리스틱 기반)

| 원칙 | 실천 방법 |
|------|-----------|
| **시스템 상태 가시성** | 로딩, 성공, 에러 상태를 항상 표시 |
| **일관성** | 같은 동작엔 같은 UI 패턴 |
| **오류 예방** | 위험 액션은 확인 단계, 비활성화로 방지 |
| **인식 최소화** | 기억이 아닌 인식으로 사용 (힌트, 플레이스홀더) |
| **유연성** | 단축키, 다양한 입력 방식 지원 |
| **오류 복구** | 명확한 에러 메시지 + 해결 방법 안내 |
| **최소 인지 부하** | 한 화면에 하나의 주요 행동 유도 |

### 로딩 상태 계층

```
즉각 반응 (< 100ms) → 피드백 불필요
단기 대기 (100ms ~ 1s) → 로딩 인디케이터 표시
중기 대기 (1s ~ 10s) → 진행률 바 + 메시지
장기 대기 (> 10s) → 백그라운드 처리 알림
```

```jsx
// Skeleton UI (레이아웃 안정성 유지)
function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-48 rounded-lg mb-4" />
      <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
      <div className="bg-gray-200 h-4 rounded w-1/2" />
    </div>
  )
}

// 낙관적 업데이트 (즉각적인 피드백)
function LikeButton({ postId, initialLiked }) {
  const [liked, setLiked] = useState(initialLiked)

  async function handleLike() {
    setLiked(prev => !prev)          // 즉시 UI 반영
    try {
      await toggleLike(postId)
    } catch {
      setLiked(prev => !prev)        // 실패 시 롤백
      toast.error('잠시 후 다시 시도해주세요')
    }
  }

  return <button onClick={handleLike}>{liked ? '♥' : '♡'}</button>
}
```

### 에러 처리 UX

```jsx
// 에러 메시지 작성 원칙:
// 1. 무슨 일이 일어났는지
// 2. 왜 일어났는지 (가능하면)
// 3. 어떻게 해결할 수 있는지

// BAD
<p>오류가 발생했습니다</p>

// GOOD
<div role="alert">
  <h3>결제를 완료할 수 없어요</h3>
  <p>카드 정보를 확인하거나 다른 결제 수단을 시도해보세요.</p>
  <button onClick={retry}>다시 시도</button>
  <a href="/help">고객센터 문의</a>
</div>
```

### 접근성 (a11y)

```jsx
// 1. 시맨틱 HTML 우선
// BAD
<div onClick={handleClick}>삭제</div>

// GOOD
<button type="button" onClick={handleClick}>삭제</button>

// 2. ARIA (HTML만으로 의미 전달 불가할 때만 사용)
<button
  aria-label="장바구니에 추가"  // 아이콘 버튼
  aria-pressed={isAdded}         // 토글 상태
  aria-disabled={isSoldOut}      // 비활성 상태 (실제 disabled와 구분)
>
  <CartIcon />
</button>

// 3. 포커스 관리 (모달)
function Modal({ isOpen, onClose }) {
  const firstFocusableRef = useRef(null)

  useEffect(() => {
    if (isOpen) firstFocusableRef.current?.focus()
  }, [isOpen])

  return isOpen ? (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">확인</h2>
      <button ref={firstFocusableRef} onClick={onClose}>닫기</button>
    </div>
  ) : null
}

// 4. 라이브 리전 (동적 콘텐츠 알림)
<div aria-live="polite" aria-atomic="true">
  {statusMessage}  {/* 변경 시 스크린리더에 알림 */}
</div>
```

**접근성 체크리스트:**

- [ ] 이미지에 의미 있는 `alt` 텍스트 (장식용은 `alt=""`)
- [ ] 폼 요소에 `<label>` 연결 (`htmlFor` + `id`)
- [ ] 키보드만으로 모든 인터랙션 가능
- [ ] 포커스 순서가 시각적 순서와 일치
- [ ] 텍스트 색상 대비비 4.5:1 이상 (일반), 3:1 (큰 텍스트)
- [ ] 동적 콘텐츠에 `aria-live` 적용
- [ ] 모달은 포커스 트랩 구현
- [ ] 에러 메시지를 `role="alert"` 또는 `aria-describedby`로 연결

### 마이크로인터랙션

```css
/* 1. 상태 전환 애니메이션 */
.button {
  transition: transform 150ms ease, background-color 150ms ease;
}
.button:hover  { transform: translateY(-1px); }
.button:active { transform: translateY(0); }

/* 2. 로딩 애니메이션 */
@keyframes shimmer {
  from { background-position: -200px 0; }
  to   { background-position: 200px 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 400px 100%;
  animation: shimmer 1.5s infinite;
}

/* 3. 모션 민감 사용자 배려 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

```jsx
// Framer Motion 활용
import { motion, AnimatePresence } from 'framer-motion'

// 리스트 아이템 등장
function AnimatedList({ items }) {
  return (
    <AnimatePresence>
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ delay: i * 0.05 }}
        >
          {item.name}
        </motion.li>
      ))}
    </AnimatePresence>
  )
}
```

### 반응형 디자인

```css
/* Mobile-First 전략 */
.container {
  padding: 1rem;          /* 모바일 기본 */
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;        /* 태블릿+ */
    max-width: 960px;
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1200px;    /* 데스크톱 */
  }
}
```

```js
// useMediaQuery 훅
function useMediaQuery(query) {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', callback)
      return () => mq.removeEventListener('change', callback)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

const isMobile = useMediaQuery('(max-width: 768px)')
```

---

> **참고 자료**
>
> - [React 공식 문서](https://react.dev)
> - [Web.dev — Core Web Vitals](https://web.dev/vitals)
> - [MDN Web Docs](https://developer.mozilla.org)
> - [WCAG 2.2 접근성 가이드](https://www.w3.org/TR/WCAG22)
