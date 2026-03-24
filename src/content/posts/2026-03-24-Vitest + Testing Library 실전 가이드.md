---
title: Vitest + Testing Library 실전 가이드
date: 2026-03-24
summary: Vite 기반 프로젝트에서 Vitest와 React Testing Library를 활용한 컴포넌트/훅 테스트 작성법을 실전 예제 중심으로 정리합니다. 단위 테스트부터 통합 테스트까지 다룹니다.
tags: [Vitest, Testing Library, React, 테스트, 프론트엔드]
---

프론트엔드 테스트는 "나중에 써야지"로 미루기 쉽지만, 한 번 익혀두면 리팩터링 공포가 사라지고 코드 자신감이 올라갑니다. **Vitest**는 Vite 생태계에 최적화된 테스트 러너이고, **React Testing Library(RTL)**는 사용자 관점에서 컴포넌트를 테스트하는 철학을 가집니다. 둘을 함께 쓰면 빠르고 실용적인 테스트를 작성할 수 있습니다.

> **목표:** Vitest + RTL 환경을 구성하고, 컴포넌트·커스텀 훅·비동기 로직을 실전 수준으로 테스트할 수 있다.

## 목차

1. [Vitest vs Jest — 왜 Vitest인가?](#1-vitest-vs-jest--왜-vitest인가)
2. [환경 설정](#2-환경-설정)
3. [기본 테스트 문법](#3-기본-테스트-문법)
4. [React Testing Library 핵심 개념](#4-react-testing-library-핵심-개념)
5. [컴포넌트 테스트 실전](#5-컴포넌트-테스트-실전)
6. [커스텀 훅 테스트](#6-커스텀-훅-테스트)
7. [비동기 테스트](#7-비동기-테스트)
8. [Mock 전략](#8-mock-전략)
9. [테스트 커버리지](#9-테스트-커버리지)
10. [실전 팁 & 안티패턴](#10-실전-팁--안티패턴)

---

## 1. Vitest vs Jest — 왜 Vitest인가?

| 항목 | Jest | Vitest |
|------|------|--------|
| 설정 | `babel-jest` 별도 설정 필요 | Vite 설정 자동 공유 |
| 속도 | 상대적으로 느림 | **HMR 기반, 매우 빠름** |
| ESM 지원 | 설정 복잡 | 기본 지원 |
| TypeScript | 별도 트랜스파일러 필요 | 즉시 지원 |
| Jest 호환 | — | `vi` API가 Jest와 거의 동일 |
| Watch 모드 | 느린 재시작 | 파일 변경 감지 빠름 |

Vite 기반 프로젝트(Vite, Nuxt, SvelteKit 등)라면 Vitest가 **설정 없이 바로 동작**합니다. Jest를 쓰던 사람도 API가 거의 같아서 이전이 쉽습니다.

---

## 2. 환경 설정

### 패키지 설치

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### vite.config.ts 설정

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,          // describe, it, expect 전역 사용
    environment: 'jsdom',   // 브라우저 환경 시뮬레이션
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
})
```

### setup.ts

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
```

### package.json 스크립트

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "coverage": "vitest run --coverage"
  }
}
```

---

## 3. 기본 테스트 문법

Vitest의 API는 Jest와 거의 동일합니다.

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('계산기', () => {
  it('두 수를 더한다', () => {
    expect(1 + 2).toBe(3)
  })

  it('빈 배열은 길이가 0이다', () => {
    expect([]).toHaveLength(0)
  })

  it('객체 비교', () => {
    expect({ name: 'Alice' }).toEqual({ name: 'Alice' })
  })
})
```

### 자주 쓰는 Matcher

```ts
expect(value).toBe(3)              // 엄격한 일치 (===)
expect(value).toEqual({ a: 1 })    // 깊은 비교
expect(value).toBeTruthy()         // truthy
expect(value).toBeFalsy()          // falsy
expect(value).toBeNull()           // null
expect(value).toBeUndefined()      // undefined
expect(arr).toContain('item')      // 배열 포함
expect(str).toMatch(/regex/)       // 정규식 매칭
expect(fn).toThrow('error msg')    // 예외 발생
// @testing-library/jest-dom 추가 matcher
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toHaveTextContent('hello')
expect(input).toHaveValue('text')
expect(button).toBeDisabled()
```

---

## 4. React Testing Library 핵심 개념

RTL의 철학: **"테스트는 소프트웨어가 사용되는 방식과 유사해야 한다."**

구현 세부사항(state, method)이 아닌 **사용자가 보는 것**을 기준으로 테스트합니다.

### 쿼리 우선순위

| 우선순위 | 쿼리 | 사용 시점 |
|---------|------|---------|
| 1 (최우선) | `getByRole` | 접근성 역할 (button, heading, link 등) |
| 2 | `getByLabelText` | 폼 레이블 |
| 3 | `getByPlaceholderText` | placeholder |
| 4 | `getByText` | 텍스트 내용 |
| 5 | `getByDisplayValue` | input/select 현재 값 |
| 6 | `getByAltText` | img alt |
| 7 | `getByTitle` | title 속성 |
| 마지막 | `getByTestId` | data-testid (다른 방법이 없을 때) |

### 쿼리 종류

```ts
// getBy: 없으면 에러, 1개 보장
const btn = screen.getByRole('button', { name: '제출' })

// queryBy: 없으면 null (존재 여부 확인 시)
const modal = screen.queryByRole('dialog')
expect(modal).not.toBeInTheDocument()

// findBy: 비동기 (Promise 반환, 기다림)
const item = await screen.findByText('로딩 완료')

// getAllBy / queryAllBy / findAllBy: 복수 요소
const items = screen.getAllByRole('listitem')
```

---

## 5. 컴포넌트 테스트 실전

### 기본 렌더링 테스트

```tsx
// components/Greeting.tsx
export function Greeting({ name }: { name: string }) {
  return <h1>안녕하세요, {name}!</h1>
}

// components/Greeting.test.tsx
import { render, screen } from '@testing-library/react'
import { Greeting } from './Greeting'

describe('Greeting', () => {
  it('이름을 올바르게 표시한다', () => {
    render(<Greeting name="철수" />)
    expect(screen.getByText('안녕하세요, 철수!')).toBeInTheDocument()
  })
})
```

### 이벤트 테스트 (userEvent 사용 권장)

```tsx
// components/Counter.tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <button onClick={() => setCount(c => c - 1)}>-1</button>
    </div>
  )
}

// components/Counter.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from './Counter'

describe('Counter', () => {
  it('+1 버튼 클릭 시 카운트가 증가한다', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: '+1' }))
    expect(screen.getByText('카운트: 1')).toBeInTheDocument()
  })

  it('여러 번 클릭해도 정상 동작한다', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: '+1' }))
    await user.click(screen.getByRole('button', { name: '+1' }))
    await user.click(screen.getByRole('button', { name: '-1' }))
    expect(screen.getByText('카운트: 1')).toBeInTheDocument()
  })
})
```

> **`userEvent` vs `fireEvent`:** `userEvent`는 실제 브라우저 이벤트 흐름(마우스 이동, focus, keydown 등)을 시뮬레이션하여 더 현실적입니다. 일반적으로 `userEvent` 사용을 권장합니다.

### 폼 테스트

```tsx
// components/LoginForm.tsx
export function LoginForm({ onSubmit }: { onSubmit: (data: { email: string; password: string }) => void }) {
  return (
    <form onSubmit={e => {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      onSubmit({ email: fd.get('email') as string, password: fd.get('password') as string })
    }}>
      <label>
        이메일
        <input name="email" type="email" />
      </label>
      <label>
        비밀번호
        <input name="password" type="password" />
      </label>
      <button type="submit">로그인</button>
    </form>
  )
}

// LoginForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

it('폼 제출 시 입력값이 콜백으로 전달된다', async () => {
  const user = userEvent.setup()
  const handleSubmit = vi.fn()
  render(<LoginForm onSubmit={handleSubmit} />)

  await user.type(screen.getByLabelText('이메일'), 'test@example.com')
  await user.type(screen.getByLabelText('비밀번호'), 'password123')
  await user.click(screen.getByRole('button', { name: '로그인' }))

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  })
})
```

---

## 6. 커스텀 훅 테스트

`renderHook`을 사용해 훅을 독립적으로 테스트합니다.

```ts
// hooks/useCounter.ts
import { useState } from 'react'

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial)
  const increment = () => setCount(c => c + 1)
  const decrement = () => setCount(c => c - 1)
  const reset = () => setCount(initial)
  return { count, increment, decrement, reset }
}

// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('초기값으로 시작한다', () => {
    const { result } = renderHook(() => useCounter(5))
    expect(result.current.count).toBe(5)
  })

  it('increment 호출 시 count가 증가한다', () => {
    const { result } = renderHook(() => useCounter())

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })

  it('reset 호출 시 초기값으로 돌아간다', () => {
    const { result } = renderHook(() => useCounter(10))

    act(() => {
      result.current.increment()
      result.current.increment()
      result.current.reset()
    })

    expect(result.current.count).toBe(10)
  })
})
```

---

## 7. 비동기 테스트

### API 호출이 있는 컴포넌트

```tsx
// components/UserProfile.tsx
export function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<{ name: string } | null>(null)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser)
  }, [userId])

  if (!user) return <p>로딩 중...</p>
  return <p>{user.name}</p>
}

// UserProfile.test.tsx
import { render, screen } from '@testing-library/react'
import { UserProfile } from './UserProfile'

it('유저 정보를 불러와서 표시한다', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ name: '홍길동' }),
  } as Response)

  render(<UserProfile userId={1} />)

  expect(screen.getByText('로딩 중...')).toBeInTheDocument()

  // 비동기 완료 대기
  expect(await screen.findByText('홍길동')).toBeInTheDocument()
})
```

### waitFor 활용

```tsx
import { waitFor } from '@testing-library/react'

it('에러 메시지가 사라진다', async () => {
  render(<Form />)
  await userEvent.setup().click(screen.getByRole('button', { name: '제출' }))

  await waitFor(() => {
    expect(screen.queryByText('오류가 발생했습니다')).not.toBeInTheDocument()
  })
})
```

---

## 8. Mock 전략

### 함수 Mock

```ts
const mockFn = vi.fn()
mockFn.mockReturnValue(42)
mockFn.mockReturnValueOnce(100) // 한 번만
mockFn.mockResolvedValue({ data: [] }) // Promise
mockFn.mockRejectedValue(new Error('실패')) // 에러

expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledTimes(2)
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
```

### 모듈 Mock

```ts
// API 모듈 전체 mock
vi.mock('@/api/posts', () => ({
  getPosts: vi.fn().mockResolvedValue([
    { id: 1, title: '테스트 포스트' },
  ]),
}))

// 일부만 mock
vi.mock('@/utils/date', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/date')>()
  return {
    ...actual,
    formatDate: vi.fn(() => '2026-03-24'),
  }
})
```

### 타이머 Mock

```ts
it('3초 후 알림이 사라진다', () => {
  vi.useFakeTimers()
  render(<Toast message="저장됨" />)

  expect(screen.getByText('저장됨')).toBeInTheDocument()

  vi.advanceTimersByTime(3000)

  expect(screen.queryByText('저장됨')).not.toBeInTheDocument()
  vi.useRealTimers()
})
```

---

## 9. 테스트 커버리지

```bash
npm run coverage
```

```
----------|---------|----------|---------|---------|
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
All files |   87.5  |   75.0   |   90.0  |   87.5  |
```

`vite.config.ts`에서 커버리지 임계값 설정:

```ts
test: {
  coverage: {
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },
}
```

> 커버리지 100%가 목표가 아닙니다. **중요한 로직과 엣지 케이스**에 집중하세요.

---

## 10. 실전 팁 & 안티패턴

### ✅ 좋은 테스트 작성법

```ts
// 사용자 행동 기준으로 테스트
it('이메일 입력 후 제출하면 성공 메시지가 표시된다', async () => { ... })

// getByRole 우선 사용
screen.getByRole('button', { name: '제출' }) // ✅
screen.getByTestId('submit-btn')             // ❌ (다른 방법이 없을 때만)

// 구체적인 assertion
expect(screen.getByText('저장 완료')).toBeInTheDocument() // ✅
expect(container).toMatchSnapshot()                       // ❌ (변경에 취약)
```

### ❌ 피해야 할 안티패턴

```ts
// 구현 세부사항 테스트 (state 직접 접근) ❌
expect(component.state.isLoading).toBe(false)

// 너무 구체적인 DOM 구조 ❌
expect(wrapper.find('div.container > ul > li:first-child')).toExist()

// 불필요한 waitFor ❌
await waitFor(() => {
  expect(screen.getByText('즉시 렌더링')).toBeInTheDocument()
})
// → render() 후 바로 expect로 충분
```

### 테스트 구조 팁

```ts
// AAA 패턴 유지 (Arrange - Act - Assert)
it('검색어 입력 시 필터링된 결과가 표시된다', async () => {
  // Arrange (준비)
  const user = userEvent.setup()
  render(<SearchList items={mockItems} />)

  // Act (실행)
  await user.type(screen.getByRole('searchbox'), '리액트')

  // Assert (검증)
  expect(screen.getByText('React 기초')).toBeInTheDocument()
  expect(screen.queryByText('Vue 기초')).not.toBeInTheDocument()
})
```

---

## 정리

| 도구 | 역할 |
|------|------|
| **Vitest** | 테스트 러너 (Jest 대체, Vite 최적화) |
| **React Testing Library** | 컴포넌트 렌더링 + 쿼리 |
| **@testing-library/user-event** | 실제 사용자 상호작용 시뮬레이션 |
| **@testing-library/jest-dom** | DOM 특화 matcher 확장 |
| **vi.fn() / vi.mock()** | 함수·모듈 mock |

처음엔 간단한 컴포넌트 렌더링 테스트부터 시작해서, 이벤트 → 비동기 → 훅 순서로 범위를 넓혀가세요. 테스트 코드도 결국 코드입니다 — **읽기 쉽고 유지보수하기 쉽게** 작성하는 것이 핵심입니다.
