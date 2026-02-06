---
title: Redux & Redux Toolkit 정리
date: 2026-02-06
summary: React 상태관리의 정석 - Redux 핵심 개념부터 Redux Toolkit 실전 활용까지
tags: [redux, redux-toolkit, react, state-management, rtk, rtk-query]
---

# Redux & Redux Toolkit 정리 (실전 중심)

**Redux**는 React 생태계에서 가장 많이 사용되는 **전역 상태관리 라이브러리**입니다.
**Redux Toolkit (RTK)**은 Redux의 복잡한 보일러플레이트를 줄이고, 모던한 방식으로 Redux를 사용할 수 있게 해주는 **공식 도구**입니다.

> 목표: Redux의 **핵심 원리를 이해**하고, Redux Toolkit으로 **빠르게 구현**하기

---

## 목차

1) Redux란?
2) Redux 핵심 개념 (Store, Action, Reducer)
3) Redux의 3가지 원칙
4) 기존 Redux의 문제점
5) Redux Toolkit (RTK)
6) RTK 핵심 API (createSlice, configureStore)
7) 비동기 처리 (createAsyncThunk)
8) RTK Query (서버 상태 관리)
9) 실전 예제 (Counter, Todo, API)
10) Redux vs Context API

---

## 1) Redux란?

### 1.1 정의

**Redux**는 JavaScript 애플리케이션을 위한 **예측 가능한 상태 컨테이너**입니다.

- React뿐만 아니라 Vue, Angular 등에서도 사용 가능
- 전역 상태를 **중앙 집중식**으로 관리
- **단방향 데이터 흐름**

### 1.2 왜 Redux를 사용하나?

**문제 상황**:
```
<App>
  <Header user={user} />
  <Main>
    <Sidebar user={user} />
    <Content user={user} />
  </Main>
</App>
```

- Props Drilling: 깊은 컴포넌트 트리에서 props 전달 지옥
- 상태 공유 어려움: 여러 컴포넌트에서 동일한 상태 접근 필요

**Redux 해결**:
```
전역 Store → 어디서든 상태 접근 가능
```

### 1.3 언제 사용하나?

| 상황 | Redux 필요도 |
|---|---|
| **소규모 앱 (5~10 컴포넌트)** | ❌ 과도함 (useState 충분) |
| **중간 규모 (여러 페이지 공유 상태)** | ⚠️ Context API vs Redux 고려 |
| **대규모 (복잡한 상태·API·캐싱)** | ✅ 필수 |
| **서버 상태 관리 중심** | ⚠️ RTK Query / React Query 검토 |

---

## 2) Redux 핵심 개념

### 2.1 전체 흐름

```
View (Component)
  ↓ dispatch(action)
Action
  ↓
Reducer
  ↓ 새로운 state 반환
Store (상태 저장)
  ↓ subscribe
View (리렌더링)
```

### 2.2 Store (스토어)

- **애플리케이션의 전체 상태**를 보관하는 객체
- **단 하나**만 존재 (Single Source of Truth)

```javascript
import { createStore } from 'redux';

const store = createStore(reducer);
```

### 2.3 Action (액션)

- **상태 변경 의도**를 나타내는 **평범한 객체**
- `type` 필드는 필수

```javascript
// Action
{
  type: 'ADD_TODO',
  payload: {
    id: 1,
    text: 'Learn Redux'
  }
}
```

**Action Creator** (액션 생성 함수):
```javascript
const addTodo = (text) => ({
  type: 'ADD_TODO',
  payload: { id: Date.now(), text }
});

// 사용
dispatch(addTodo('Learn Redux'));
```

### 2.4 Reducer (리듀서)

- **(이전 state, action) → 새로운 state**를 반환하는 **순수 함수**
- **불변성 유지** 필수 (직접 수정 금지)

```javascript
const initialState = { count: 0 };

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 }; // ✅ 새 객체 반환
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
}
```

**주의**:
```javascript
// ❌ 잘못된 예 (직접 수정)
state.count += 1;
return state;

// ✅ 올바른 예 (불변성 유지)
return { ...state, count: state.count + 1 };
```

---

## 3) Redux의 3가지 원칙

### 3.1 Single Source of Truth

- 애플리케이션의 모든 상태는 **하나의 Store**에 저장

### 3.2 State is Read-Only

- 상태는 **읽기 전용** (직접 수정 불가)
- 상태 변경은 **오직 Action을 dispatch**해서만 가능

```javascript
// ❌ 직접 수정 절대 금지
store.getState().count = 10;

// ✅ Action으로만 변경
dispatch({ type: 'SET_COUNT', payload: 10 });
```

### 3.3 Changes are Made with Pure Functions

- Reducer는 **순수 함수**여야 함
  - 같은 입력 → 항상 같은 출력
  - 부수 효과(Side Effect) 없음
  - 외부 API 호출, 랜덤 값 생성 금지

---

## 4) 기존 Redux의 문제점

### 4.1 많은 보일러플레이트

```javascript
// Action Types
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

// Action Creators
const increment = () => ({ type: INCREMENT });
const decrement = () => ({ type: DECREMENT });

// Reducer
const counterReducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case INCREMENT:
      return { count: state.count + 1 };
    case DECREMENT:
      return { count: state.count - 1 };
    default:
      return state;
  }
};

// Store
const store = createStore(counterReducer);
```

**문제**: 간단한 카운터 하나에 너무 많은 코드!

### 4.2 불변성 유지 어려움

```javascript
// 복잡한 중첩 객체 업데이트
return {
  ...state,
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      name: action.payload
    }
  }
};
```

### 4.3 비동기 처리 복잡

- redux-thunk, redux-saga 같은 미들웨어 추가 필요
- 설정과 학습 곡선 높음

---

## 5) Redux Toolkit (RTK)

### 5.1 Redux Toolkit이란?

**Redux 공식 팀이 만든 현대적인 Redux 개발 도구**

```bash
npm install @reduxjs/toolkit react-redux
```

### 5.2 RTK의 장점

✅ **보일러플레이트 90% 감소**
✅ **Immer.js 내장** (불변성 자동 관리)
✅ **Redux DevTools 기본 설정**
✅ **비동기 처리 간편화** (createAsyncThunk)
✅ **RTK Query** (서버 상태 관리 내장)

### 5.3 기존 Redux vs RTK

| 항목 | 기존 Redux | Redux Toolkit |
|---|---|---|
| 코드량 | 많음 | 적음 (1/3 수준) |
| 불변성 | 수동 관리 | Immer 자동 관리 |
| 설정 | 복잡 | configureStore |
| 비동기 | 미들웨어 필요 | createAsyncThunk |

---

## 6) RTK 핵심 API

### 6.1 createSlice

**한 번에 Reducer + Action Creator 생성**

```javascript
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment(state) {
      state.count += 1; // Immer가 불변성 자동 처리!
    },
    decrement(state) {
      state.count -= 1;
    },
    incrementByAmount(state, action) {
      state.count += action.payload;
    }
  }
});

// Action Creators 자동 생성
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Reducer 내보내기
export default counterSlice.reducer;
```

**핵심**:
- `state.count += 1` 처럼 **직접 수정해도 됨** (Immer가 내부적으로 불변성 처리)
- Action Creator 자동 생성 (`increment()` 함수)

### 6.2 configureStore

**Store 생성 간소화 + DevTools 자동 설정**

```javascript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import userReducer from './userSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer
  }
  // Redux DevTools, redux-thunk 자동 설정됨
});

export default store;
```

### 6.3 React 연결

```javascript
// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

```javascript
// Counter.jsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './counterSlice';

function Counter() {
  const count = useSelector((state) => state.counter.count);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}
```

---

## 7) 비동기 처리 (createAsyncThunk)

### 7.1 createAsyncThunk

**API 호출 같은 비동기 작업 처리**

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 비동기 Thunk
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default userSlice.reducer;
```

**사용**:
```javascript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './userSlice';

function UserProfile({ userId }) {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUser(userId));
  }, [dispatch, userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return <div>Name: {data.name}</div>;
}
```

### 7.2 상태 흐름

```
dispatch(fetchUser(1))
  ↓
fetchUser.pending
  ↓ API 호출
fetchUser.fulfilled (성공)
  또는
fetchUser.rejected (실패)
```

---

## 8) RTK Query (서버 상태 관리)

### 8.1 RTK Query란?

**데이터 페칭·캐싱·자동 리페칭**을 지원하는 강력한 도구 (React Query와 유사)

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/users'
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`
    }),
    createUser: builder.mutation({
      query: (newUser) => ({
        url: '/users',
        method: 'POST',
        body: newUser
      })
    })
  })
});

export const { useGetUsersQuery, useGetUserByIdQuery, useCreateUserMutation } = apiSlice;
```

**Store 설정**:
```javascript
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware)
});
```

**컴포넌트에서 사용**:
```javascript
function UserList() {
  const { data, isLoading, error } = useGetUsersQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**장점**:
- 자동 캐싱
- 로딩·에러 상태 자동 관리
- 재페칭 전략 설정 가능
- Mutation (POST, PUT, DELETE) 지원

---

## 9) 실전 예제

### 9.1 Todo 앱 (Full Example)

**todoSlice.js**:
```javascript
import { createSlice } from '@reduxjs/toolkit';

const todoSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.push(action.payload);
      },
      prepare(text) {
        return {
          payload: {
            id: Date.now(),
            text,
            completed: false
          }
        };
      }
    },
    toggleTodo(state, action) {
      const todo = state.find(t => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    deleteTodo(state, action) {
      return state.filter(t => t.id !== action.payload);
    }
  }
});

export const { addTodo, toggleTodo, deleteTodo } = todoSlice.actions;
export default todoSlice.reducer;
```

**TodoApp.jsx**:
```javascript
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTodo, toggleTodo, deleteTodo } from './todoSlice';

function TodoApp() {
  const [input, setInput] = useState('');
  const todos = useSelector((state) => state.todos);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      dispatch(addTodo(input));
      setInput('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add todo"
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch(toggleTodo(todo.id))}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch(deleteTodo(todo.id))}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 9.2 폴더 구조 권장

```
src/
  features/
    counter/
      counterSlice.js
      Counter.jsx
    todos/
      todoSlice.js
      TodoList.jsx
    user/
      userSlice.js
      userAPI.js
      UserProfile.jsx
  app/
    store.js
  index.js
```

---

## 10) Redux vs Context API

| 항목 | Redux Toolkit | Context API |
|---|---|---|
| **학습 곡선** | 중간 | 쉬움 |
| **보일러플레이트** | 적음 (RTK 기준) | 매우 적음 |
| **성능** | 최적화 쉬움 | 최적화 어려움 (전체 리렌더링) |
| **DevTools** | ✅ 강력 | ❌ 없음 |
| **미들웨어** | ✅ 지원 | ❌ 없음 |
| **비동기 처리** | ✅ createAsyncThunk | 수동 구현 필요 |
| **적합한 경우** | 복잡한 상태·API 많음 | 간단한 전역 상태 |

**권장**:
- **간단한 전역 상태** (테마, 로그인 유저) → Context API
- **복잡한 비즈니스 로직·API 캐싱** → Redux Toolkit + RTK Query

---

## 정리 (체크리스트)

### Redux 핵심 원칙
- [ ] Single Source of Truth (하나의 Store)
- [ ] State is Read-Only (Action으로만 변경)
- [ ] Pure Functions (Reducer는 순수 함수)

### Redux Toolkit 필수 API
- [ ] `createSlice` (Reducer + Action Creator)
- [ ] `configureStore` (Store 생성)
- [ ] `createAsyncThunk` (비동기 처리)
- [ ] RTK Query (서버 상태 관리)

### 실전 팁
- [ ] 불변성 걱정 NO (Immer 자동 처리)
- [ ] 상태 구조 **평평하게** 유지
- [ ] 복잡한 로직은 **Selector** 활용 (`createSelector`)
- [ ] 비동기는 `createAsyncThunk` 또는 RTK Query
- [ ] Redux DevTools로 상태 변화 추적

> **2024년 기준 Redux = Redux Toolkit**
> 레거시 Redux 코드는 가능하면 RTK로 마이그레이션 권장!
