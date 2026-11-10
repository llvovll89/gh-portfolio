---
title: React Hook 심화 정리
date: 2026-02-09
summary: React Hook의 핵심 개념부터 성능 최적화, Custom Hook 작성까지 실전 예제와 함께 완벽 정리
tags: [react, hooks, useState, useEffect, useCallback, useMemo, useRef, custom-hooks, performance]
category: Frontend
---

# React Hook 심화 정리

**React Hook**은 React 16.8에서 도입된 함수형 컴포넌트에서 상태와 생명주기 기능을 사용할 수 있게 해주는 기능입니다.
클래스 컴포넌트 없이도 강력한 React 기능을 활용할 수 있습니다.

> 목표: Hook의 **동작 원리를 이해**하고, **최적화 기법**을 활용한 **실전 개발 능력** 키우기

---

## 목차

1) React Hook이란?
2) 기본 Hook (useState, useEffect)
3) 최적화 Hook (useCallback, useMemo)
4) 참조 Hook (useRef)
5) 고급 Hook (useReducer, useContext)
6) Custom Hook 만들기
7) Hook 규칙과 주의사항
8) 실전 패턴과 Best Practices
9) 성능 최적화 전략

---

## 1) React Hook이란?

### 1.1 정의

**Hook**은 함수형 컴포넌트에서 React 상태와 생명주기 기능을 "연결(hook into)"할 수 있게 해주는 함수입니다.

**특징**:
- 함수형 컴포넌트에서만 사용
- 클래스 컴포넌트의 복잡성 제거
- 로직 재사용 용이
- 테스트 친화적

### 1.2 왜 Hook을 사용하나?

**클래스 컴포넌트의 문제점**:
```jsx
// 🔴 클래스 컴포넌트 - 복잡하고 장황함
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.increment = this.increment.bind(this); // this 바인딩 필요
  }

  increment() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return <button onClick={this.increment}>{this.state.count}</button>;
  }
}
```

**Hook 사용 - 간결하고 직관적**:
```jsx
// ✅ 함수형 컴포넌트 + Hook
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

---

## 2) 기본 Hook (useState, useEffect)

### 2.1 useState - 상태 관리

**기본 사용법**:
```jsx
import { useState } from 'react';

function Example() {
  // [현재값, 업데이트함수] = useState(초기값)
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [user, setUser] = useState({ name: '', age: 0 });

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}
```

**함수형 업데이트 (중요!)**:
```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ 문제: 여러 번 호출해도 1만 증가
  const handleBad = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    // count는 0이므로 모두 setCount(1)과 동일
  };

  // ✅ 해결: 함수형 업데이트 사용
  const handleGood = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    // 3씩 증가!
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={handleGood}>+3</button>
    </div>
  );
}
```

**객체 상태 업데이트**:
```jsx
function UserForm() {
  const [user, setUser] = useState({ name: '', email: '', age: 0 });

  // ✅ 스프레드 연산자로 기존 상태 유지
  const updateName = (name) => {
    setUser(prev => ({ ...prev, name }));
  };

  const updateEmail = (email) => {
    setUser(prev => ({ ...prev, email }));
  };

  return (
    <div>
      <input
        value={user.name}
        onChange={(e) => updateName(e.target.value)}
        placeholder="이름"
      />
      <input
        value={user.email}
        onChange={(e) => updateEmail(e.target.value)}
        placeholder="이메일"
      />
      <p>{user.name} ({user.email})</p>
    </div>
  );
}
```

### 2.2 useEffect - 부수 효과 처리

**기본 개념**:
- 렌더링 후 실행되는 코드
- API 호출, 구독(subscription), 타이머, DOM 조작 등

**의존성 배열에 따른 실행 시점**:
```jsx
function EffectExample() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // 1️⃣ 컴포넌트 마운트 + 모든 업데이트마다 실행
  useEffect(() => {
    console.log('렌더링될 때마다 실행');
  });

  // 2️⃣ 컴포넌트 마운트 시 단 한 번만 실행
  useEffect(() => {
    console.log('마운트 시 한 번만 실행');
  }, []);

  // 3️⃣ count가 변경될 때만 실행
  useEffect(() => {
    console.log('count 변경:', count);
  }, [count]);

  // 4️⃣ count 또는 name이 변경될 때 실행
  useEffect(() => {
    console.log('count 또는 name 변경');
  }, [count, name]);

  return <div>...</div>;
}
```

**클린업(cleanup) 함수**:
```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // 타이머 시작
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // ✅ 클린업 함수: 컴포넌트 언마운트 시 실행
    return () => {
      clearInterval(interval);
      console.log('타이머 정리됨');
    };
  }, []); // 빈 배열: 마운트 시 한 번만 설정

  return <p>{seconds}초 경과</p>;
}
```

**실전 예제: API 데이터 가져오기**:
```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // userId가 없으면 실행하지 않음
    if (!userId) return;

    let cancelled = false; // 클린업 플래그

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();

        // 클린업 실행 후라면 상태 업데이트 안 함
        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    // ✅ 클린업: userId 변경 시 이전 요청 무효화
    return () => {
      cancelled = true;
    };
  }, [userId]); // userId 변경 시마다 재실행

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!user) return <div>사용자를 찾을 수 없습니다</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

---

## 3) 최적화 Hook (useCallback, useMemo)

### 3.1 useCallback - 함수 메모이제이션

**문제 상황**:
```jsx
function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // ❌ 문제: 매 렌더링마다 새 함수 생성
  const handleClick = () => {
    console.log('클릭!');
  };

  return (
    <div>
      <Child onClick={handleClick} />
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </div>
  );
}

// Child는 React.memo로 최적화되어 있지만
// onClick이 매번 바뀌어서 불필요하게 리렌더링됨
const Child = React.memo(({ onClick }) => {
  console.log('Child 렌더링');
  return <button onClick={onClick}>버튼</button>;
});
```

**해결: useCallback 사용**:
```jsx
function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // ✅ 의존성이 없으므로 함수가 재생성되지 않음
  const handleClick = useCallback(() => {
    console.log('클릭!');
  }, []);

  // ✅ count가 변경될 때만 함수 재생성
  const handleIncrement = useCallback(() => {
    setCount(count + 1);
  }, [count]);

  // ✅ 더 좋은 방법: 함수형 업데이트로 의존성 제거
  const handleIncrementBetter = useCallback(() => {
    setCount(prev => prev + 1);
  }, []); // 의존성 없음!

  return (
    <div>
      <Child onClick={handleClick} />
      <button onClick={handleIncrementBetter}>증가</button>
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </div>
  );
}
```

### 3.2 useMemo - 값 메모이제이션

**무거운 연산 최적화**:
```jsx
function ExpensiveComponent({ numbers }) {
  // ❌ 문제: 매 렌더링마다 계산
  const sum = numbers.reduce((a, b) => a + b, 0);

  // ✅ 해결: numbers가 변경될 때만 재계산
  const sum = useMemo(() => {
    console.log('합계 계산 중...');
    return numbers.reduce((a, b) => a + b, 0);
  }, [numbers]);

  return <div>합계: {sum}</div>;
}
```

**객체/배열 참조 안정화**:
```jsx
function FilteredList({ items, filterType }) {
  // ❌ 문제: 매 렌더링마다 새 배열 생성
  const filteredItems = items.filter(item => item.type === filterType);

  // ✅ 해결: 의존성이 변경될 때만 새 배열 생성
  const filteredItems = useMemo(() => {
    return items.filter(item => item.type === filterType);
  }, [items, filterType]);

  return (
    <List items={filteredItems} /> // items가 안정적이면 List 리렌더링 방지
  );
}
```

### 3.3 useCallback vs useMemo

```jsx
// useCallback: 함수 자체를 메모이제이션
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// useMemo: 함수의 반환값을 메모이제이션
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// 사실 이 둘은 동일!
const memoizedCallback = useMemo(() => {
  return () => doSomething(a, b);
}, [a, b]);
```

---

## 4) 참조 Hook (useRef)

### 4.1 DOM 요소 접근

```jsx
function TextInput() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>포커스</button>
    </div>
  );
}
```

### 4.2 렌더링 없이 값 저장 (중요!)

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  const start = () => {
    // ✅ ref는 값이 변경되어도 리렌더링 안 됨
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
  };

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <p>{seconds}초</p>
      <button onClick={start}>시작</button>
      <button onClick={stop}>정지</button>
    </div>
  );
}
```

### 4.3 이전 값 기억하기

```jsx
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>현재: {count}</p>
      <p>이전: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}
```

---

## 5) 고급 Hook (useReducer, useContext)

### 5.1 useReducer - 복잡한 상태 로직

**언제 사용?**
- 다음 상태가 이전 상태에 의존적일 때
- 여러 하위 값을 포함하는 복잡한 상태 구조
- 상태 업데이트 로직을 컴포넌트 외부로 분리하고 싶을 때

**기본 예제**:
```jsx
import { useReducer } from 'react';

// 1️⃣ 리듀서 함수 정의
function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function Counter() {
  // 2️⃣ useReducer(리듀서, 초기상태)
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>리셋</button>
    </div>
  );
}
```

**실전 예제: Todo 앱**:
```jsx
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        { id: Date.now(), text: action.payload, done: false }
      ];
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, done: !todo.done }
          : todo
      );
    case 'DELETE_TODO':
      return state.filter(todo => todo.id !== action.payload);
    default:
      return state;
  }
}

function TodoApp() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      dispatch({ type: 'ADD_TODO', payload: input });
      setInput('');
    }
  };

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button onClick={handleAdd}>추가</button>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
            />
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5.2 useContext - 전역 상태 공유

**기본 사용법**:
```jsx
import { createContext, useContext, useState } from 'react';

// 1️⃣ Context 생성
const ThemeContext = createContext();

// 2️⃣ Provider 컴포넌트
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3️⃣ Custom Hook으로 감싸기 (선택사항이지만 권장)
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 4️⃣ 사용
function App() {
  return (
    <ThemeProvider>
      <Toolbar />
    </ThemeProvider>
  );
}

function Toolbar() {
  return <ThemeButton />;
}

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{ background: theme === 'dark' ? '#333' : '#fff' }}
    >
      현재 테마: {theme}
    </button>
  );
}
```

**useReducer + useContext 조합**:
```jsx
const TodoContext = createContext();

function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, []);

  return (
    <TodoContext.Provider value={{ todos, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
}

function useTodos() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within TodoProvider');
  }
  return context;
}

// 어디서든 사용 가능
function TodoList() {
  const { todos, dispatch } = useTodos();
  // ...
}
```

---

## 6) Custom Hook 만들기

### 6.1 기본 개념

**Custom Hook이란?**
- `use`로 시작하는 함수
- 다른 Hook을 호출할 수 있음
- 로직 재사용을 위한 패턴

### 6.2 실전 Custom Hook 예제

**useDebounce - 입력 지연 처리**:
```jsx
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 사용
function SearchInput() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch) {
      // API 호출
      console.log('검색:', debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="검색..."
    />
  );
}
```

**useLocalStorage - 로컬 스토리지 동기화**:
```jsx
function useLocalStorage(key, initialValue) {
  // 초기값 가져오기
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // 값 저장 함수
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// 사용
function App() {
  const [name, setName] = useLocalStorage('name', '익명');

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <p>안녕하세요, {name}님!</p>
    </div>
  );
}
```

**useFetch - API 호출 추상화**:
```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}

// 사용
function UserList() {
  const { data: users, loading, error } = useFetch('/api/users');

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**useToggle - boolean 상태 토글**:
```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  return [value, toggle];
}

// 사용
function Modal() {
  const [isOpen, toggleOpen] = useToggle();

  return (
    <div>
      <button onClick={toggleOpen}>모달 열기</button>
      {isOpen && (
        <div className="modal">
          <p>모달 내용</p>
          <button onClick={toggleOpen}>닫기</button>
        </div>
      )}
    </div>
  );
}
```

---

## 7) Hook 규칙과 주의사항

### 7.1 Hook의 규칙

**1. 최상위에서만 Hook 호출**
```jsx
// ❌ 잘못된 사용
function Bad({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // 조건부 호출 금지!
  }

  for (let i = 0; i < 10; i++) {
    useEffect(() => {}); // 반복문 안 금지!
  }
}

// ✅ 올바른 사용
function Good({ condition }) {
  const [state, setState] = useState(0);

  useEffect(() => {
    if (condition) {
      // 조건은 Hook 내부에서
    }
  }, [condition]);
}
```

**2. React 함수 컴포넌트 또는 Custom Hook에서만 호출**
```jsx
// ❌ 잘못된 사용
function regularFunction() {
  const [state, setState] = useState(0); // 일반 함수에서 사용 금지!
}

// ✅ 올바른 사용
function MyComponent() {
  const [state, setState] = useState(0); // 컴포넌트에서 OK
}

function useCustomHook() {
  const [state, setState] = useState(0); // Custom Hook에서 OK
}
```

### 7.2 의존성 배열 주의사항

**exhaustive-deps 경고 해결하기**:
```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // ❌ 경고: userId가 의존성에 없음
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, []); // React Hook useEffect has a missing dependency: 'userId'

  // ✅ 해결: 의존성 추가
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
}
```

**함수를 의존성에 넣을 때**:
```jsx
function SearchComponent({ onSearch }) {
  const [query, setQuery] = useState('');

  // ❌ 문제: onSearch가 부모에서 매번 새로 생성되면 무한 루프
  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  // ✅ 해결 1: 부모에서 useCallback 사용
  // ✅ 해결 2: 함수를 의존성에서 제외 (eslint-disable 주석 필요)
  useEffect(() => {
    onSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
}
```

### 7.3 흔한 실수들

**Stale Closure 문제**:
```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // ❌ 문제: count는 항상 0 (클로저에 갇힘)
      console.log(count);
    }, 1000);

    return () => clearInterval(interval);
  }, []); // 빈 의존성 배열

  // ✅ 해결 1: count를 의존성에 추가
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count);
    }, 1000);

    return () => clearInterval(interval);
  }, [count]);

  // ✅ 해결 2: 함수형 업데이트 사용
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        console.log(prev);
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

## 8) 실전 패턴과 Best Practices

### 8.1 조건부 렌더링과 Hook

```jsx
function ConditionalComponent({ showAdvanced }) {
  // ✅ Hook은 항상 호출, 사용 여부만 분기
  const [basic, setBasic] = useState('');
  const [advanced, setAdvanced] = useState('');

  return (
    <div>
      <input value={basic} onChange={(e) => setBasic(e.target.value)} />
      {showAdvanced && (
        <input value={advanced} onChange={(e) => setAdvanced(e.target.value)} />
      )}
    </div>
  );
}
```

### 8.2 초기화 함수 사용하기

```jsx
function ExpensiveComponent() {
  // ❌ 나쁨: 매 렌더링마다 함수 실행
  const [data, setData] = useState(expensiveInitialization());

  // ✅ 좋음: 첫 렌더링에만 실행
  const [data, setData] = useState(() => expensiveInitialization());

  return <div>{data}</div>;
}
```

### 8.3 비동기 처리 패턴

```jsx
function AsyncComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // ❌ async 함수를 직접 useEffect에 전달 불가
    // useEffect(async () => { ... }, []); // 이렇게 하면 안 됨!

    // ✅ 내부에서 async 함수 정의
    const fetchData = async () => {
      const result = await fetch('/api/data');
      const json = await result.json();

      if (!cancelled) {
        setData(json);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return <div>{data}</div>;
}
```

---

## 9) 성능 최적화 전략

### 9.1 React.memo와 Hook 조합

```jsx
// 자식 컴포넌트 최적화
const ExpensiveChild = React.memo(({ data, onUpdate }) => {
  console.log('ExpensiveChild 렌더링');
  return <div onClick={onUpdate}>{data}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState('초기 데이터');

  // ✅ useCallback으로 함수 안정화
  const handleUpdate = useCallback(() => {
    setData('업데이트된 데이터');
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveChild data={data} onUpdate={handleUpdate} />
    </div>
  );
}
```

### 9.2 코드 분할과 Lazy Loading

```jsx
import { lazy, Suspense } from 'react';

// ✅ 동적 임포트
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button onClick={() => setShow(true)}>무거운 컴포넌트 로드</button>

      {show && (
        <Suspense fallback={<div>로딩 중...</div>}>
          <HeavyComponent />
        </Suspense>
      )}
    </div>
  );
}
```

### 9.3 Virtual Scrolling

```jsx
function useVirtualScroll(items, itemHeight, containerHeight) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

  const visibleItems = useMemo(() => {
    return items.slice(visibleStart, visibleEnd);
  }, [items, visibleStart, visibleEnd]);

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    offsetY: visibleStart * itemHeight,
    onScroll: (e) => setScrollTop(e.target.scrollTop),
  };
}

// 사용
function VirtualList({ items }) {
  const { visibleItems, totalHeight, offsetY, onScroll } = useVirtualScroll(
    items,
    50, // 아이템 높이
    500  // 컨테이너 높이
  );

  return (
    <div style={{ height: 500, overflow: 'auto' }} onScroll={onScroll}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(item => (
            <div key={item.id} style={{ height: 50 }}>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 마무리

React Hook은 함수형 컴포넌트의 **강력한 도구**입니다.

**핵심 요약**:
1. **useState**: 상태 관리, 함수형 업데이트 활용
2. **useEffect**: 부수 효과 처리, 클린업 함수 필수
3. **useCallback/useMemo**: 성능 최적화, 불필요한 리렌더링 방지
4. **useRef**: DOM 접근, 렌더링 없는 값 저장
5. **useReducer**: 복잡한 상태 로직 관리
6. **useContext**: 전역 상태 공유
7. **Custom Hook**: 로직 재사용, 관심사 분리

**다음 단계**:
- React Query / SWR로 서버 상태 관리 학습
- Zustand / Jotai 등 경량 상태관리 라이브러리 탐구
- React 19의 새로운 Hook (useTransition, useDeferredValue 등) 학습

**추가 학습 자료**:
- [React 공식 문서 - Hooks](https://react.dev/reference/react)
- [usehooks.com](https://usehooks.com/) - Custom Hook 예제 모음
- [React Hook Form](https://react-hook-form.com/) - 폼 최적화 라이브러리
