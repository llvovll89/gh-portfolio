---
title: TypeScript 고급 타입 실전 가이드: 제네릭, 조건부 타입, 유틸리티 타입 완전 정복
date: 2026-03-28
summary: TypeScript의 강력한 타입 시스템을 실전에서 활용하는 방법을 정리합니다. 제네릭 고급 패턴, 조건부 타입, infer, 템플릿 리터럴 타입, 커스텀 유틸리티 타입까지 실무 예제 중심으로 다룹니다.
tags: [TypeScript, 고급타입, 제네릭, 조건부타입, Frontend]
---

TypeScript의 진정한 힘은 단순한 타입 주석을 넘어 **타입으로 비즈니스 로직을 표현**하는 데 있습니다. 제네릭, 조건부 타입, `infer`, 템플릿 리터럴 타입을 활용하면 런타임 오류를 컴파일 타임에 잡고, 자동완성이 완벽하게 동작하는 타입 안전한 코드를 작성할 수 있습니다.

> 목표: TypeScript 고급 타입 기능을 실무 코드에 적용해 타입 안전성을 높이고, 반복적인 타입 정의를 줄이는 커스텀 유틸리티 타입을 만들 수 있다.

## 목차

1. [제네릭 고급 패턴](#1-제네릭-고급-패턴)
2. [조건부 타입 (Conditional Types)](#2-조건부-타입-conditional-types)
3. [infer — 타입 추출](#3-infer--타입-추출)
4. [템플릿 리터럴 타입](#4-템플릿-리터럴-타입)
5. [매핑 타입 (Mapped Types)](#5-매핑-타입-mapped-types)
6. [내장 유틸리티 타입 완전 정복](#6-내장-유틸리티-타입-완전-정복)
7. [커스텀 유틸리티 타입 만들기](#7-커스텀-유틸리티-타입-만들기)
8. [discriminated union 패턴](#8-discriminated-union-패턴)
9. [실전 타입 패턴 모음](#9-실전-타입-패턴-모음)
10. [타입 디버깅 팁](#10-타입-디버깅-팁)

---

## 1. 제네릭 고급 패턴

### 제네릭 제약 (Constraints)

```ts
// T는 반드시 id 필드를 가진 객체여야 함
function getById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// 두 객체를 병합 — 키 충돌 방지
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}

// 특정 키의 값 타입을 가져오기
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: '김철수', age: 30 };
const name = getProperty(user, 'name'); // type: string
const age = getProperty(user, 'age');   // type: number
// getProperty(user, 'email'); // 컴파일 오류!
```

### 제네릭 기본값

```ts
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message: string;
}

// 기본값 사용
type UnknownResponse = ApiResponse;        // ApiResponse<unknown>
type UserResponse = ApiResponse<User>;     // ApiResponse<User>
type ListResponse = ApiResponse<User[]>;   // ApiResponse<User[]>
```

### 여러 제네릭 파라미터

```ts
// 함수의 첫 번째와 마지막 인수 타입을 변환
function pipe<A, B, C>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C
): C {
  return fn2(fn1(value));
}

const result = pipe(
  '  hello  ',
  (s) => s.trim(),        // string → string
  (s) => s.toUpperCase()  // string → string
);
// result: string
```

---

## 2. 조건부 타입 (Conditional Types)

`T extends U ? X : Y` 형태로, 타입을 조건에 따라 분기합니다.

```ts
// 기본 조건부 타입
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
type C = IsString<'hello'>; // true

// 배열 여부 확인
type IsArray<T> = T extends any[] ? true : false;

// null/undefined 제거
type NonNullable<T> = T extends null | undefined ? never : T;

type D = NonNullable<string | null | undefined>; // string
```

### 분산 조건부 타입 (Distributive)

유니온 타입에 조건부 타입을 적용하면 각 멤버에 분산 적용됩니다.

```ts
type ToArray<T> = T extends any ? T[] : never;

type E = ToArray<string | number>;
// → string[] | number[]  (분산 적용)
// 만약 분산 원하지 않으면:
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type F = ToArrayNonDist<string | number>;
// → (string | number)[]
```

### 실용적인 조건부 타입

```ts
// 함수 타입이면 반환 타입, 아니면 never
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

// Promise를 벗기기
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

type G = Awaited<Promise<Promise<string>>>; // string

// 배열 요소 타입 추출
type ElementType<T> = T extends (infer U)[] ? U : never;

type H = ElementType<string[]>;   // string
type I = ElementType<number[][]>; // number[]
```

---

## 3. infer — 타입 추출

`infer`는 조건부 타입 안에서 타입을 **추론하고 바인딩**합니다.

```ts
// 함수 파라미터 타입 추출
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

// 함수 반환 타입 추출
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never;

// Promise 내부 타입 추출
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// 배열 첫 번째 요소 타입
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;

type J = First<[string, number, boolean]>; // string

// 배열 마지막 요소 타입
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

type K = Last<[string, number, boolean]>; // boolean
```

### 실전 예시 — API 훅 반환 타입 추출

```ts
function useUser() {
  return {
    user: null as User | null,
    isLoading: false,
    error: null as Error | null,
    refetch: async () => {},
  };
}

// 훅 반환 타입 자동 추출
type UseUserReturn = ReturnType<typeof useUser>;
// { user: User | null; isLoading: boolean; error: Error | null; refetch: () => Promise<void> }

// 컴포넌트 Props로 재사용
function UserCard(props: UseUserReturn) {
  const { user, isLoading } = props;
  // ...
}
```

---

## 4. 템플릿 리터럴 타입

문자열 타입을 조합해 새로운 타입을 만듭니다.

```ts
// 기본 사용
type Direction = 'top' | 'right' | 'bottom' | 'left';
type CssMargin = `margin-${Direction}`;
// 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left'

// 이벤트 핸들러 타입 생성
type EventName = 'click' | 'focus' | 'blur' | 'change';
type Handler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur' | 'onChange'

// API 엔드포인트 타입
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = '/users' | '/posts' | '/comments';
type ApiRoute = `${HttpMethod} ${Endpoint}`;
// 'GET /users' | 'GET /posts' | ... 12가지 조합
```

### camelCase ↔ snake_case 변환 타입

```ts
// snake_case → camelCase
type CamelCase<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<CamelCase<Tail>>}`
    : S;

type L = CamelCase<'user_first_name'>; // 'userFirstName'

// 객체 키 전체 변환
type CamelCaseKeys<T> = {
  [K in keyof T as CamelCase<K & string>]: T[K]
};

type SnakeUser = { user_id: number; first_name: string; created_at: string };
type CamelUser = CamelCaseKeys<SnakeUser>;
// { userId: number; firstName: string; createdAt: string }
```

---

## 5. 매핑 타입 (Mapped Types)

기존 타입의 키를 순회해 새 타입을 만듭니다.

```ts
// 모든 속성을 옵셔널로
type Partial<T> = { [K in keyof T]?: T[K] };

// 모든 속성을 필수로
type Required<T> = { [K in keyof T]-?: T[K] };

// 모든 속성을 읽기 전용으로
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// 특정 키만 선택
type Pick<T, K extends keyof T> = { [P in K]: T[P] };

// 특정 키 제외
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
```

### 키 재매핑 (as 절)

```ts
// getter 메서드 타입 자동 생성
type Getters<T> = {
  [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K]
};

interface User {
  name: string;
  age: number;
  email: string;
}

type UserGetters = Getters<User>;
// {
//   getName: () => string;
//   getAge: () => number;
//   getEmail: () => string;
// }

// 특정 값 타입의 키만 선택
type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T];

type StringKeys = KeysOfType<User, string>;
// 'name' | 'email'
```

---

## 6. 내장 유틸리티 타입 완전 정복

```ts
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
}

// Partial<T> — 모든 속성 옵셔널
type UpdateProduct = Partial<Product>;

// Required<T> — 모든 속성 필수
type FullProduct = Required<Product>;

// Pick<T, K> — 특정 키만 선택
type ProductCard = Pick<Product, 'id' | 'name' | 'price'>;

// Omit<T, K> — 특정 키 제외
type CreateProduct = Omit<Product, 'id'>;

// Exclude<T, U> — 유니온에서 타입 제거
type Status = 'pending' | 'active' | 'inactive' | 'deleted';
type ActiveStatus = Exclude<Status, 'deleted' | 'inactive'>; // 'pending' | 'active'

// Extract<T, U> — 유니온에서 타입 추출
type InactiveTypes = Extract<Status, 'inactive' | 'deleted'>; // 'inactive' | 'deleted'

// NonNullable<T> — null/undefined 제거
type SafeString = NonNullable<string | null | undefined>; // string

// Record<K, V> — 키-값 매핑 객체
type StatusMap = Record<Status, { label: string; color: string }>;

// Parameters<F> — 함수 파라미터 타입
function createUser(name: string, age: number, role: 'admin' | 'user') {}
type CreateUserParams = Parameters<typeof createUser>;
// [name: string, age: number, role: 'admin' | 'user']

// ReturnType<F> — 함수 반환 타입
type CreatedUser = ReturnType<typeof createUser>; // void

// Awaited<T> — Promise 언래핑
async function fetchUser(): Promise<User> { /* ... */ return {} as User; }
type FetchedUser = Awaited<ReturnType<typeof fetchUser>>; // User
```

---

## 7. 커스텀 유틸리티 타입 만들기

### DeepPartial — 중첩 객체까지 옵셔널

```ts
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface Config {
  server: { host: string; port: number };
  database: { url: string; pool: { min: number; max: number } };
}

type PartialConfig = DeepPartial<Config>;
// server.host, database.pool.min 등이 모두 옵셔널
```

### DeepReadonly — 중첩 불변 객체

```ts
type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
```

### Nullable<T> / Maybe<T>

```ts
type Nullable<T> = T | null;
type Maybe<T> = T | null | undefined;

type NullableUser = Nullable<User>;  // User | null
type MaybeUser = Maybe<User>;        // User | null | undefined
```

### ValueOf<T> — 객체 값 타입 유니온

```ts
type ValueOf<T> = T[keyof T];

const ROUTES = {
  HOME: '/',
  BLOG: '/blog',
  ABOUT: '/about',
} as const;

type Route = ValueOf<typeof ROUTES>; // '/' | '/blog' | '/about'
```

### RequireAtLeastOne<T>

```ts
// T에서 최소 하나의 키는 반드시 있어야 함
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>
}[Keys];

interface SearchOptions {
  name?: string;
  email?: string;
  phone?: string;
}

type ValidSearch = RequireAtLeastOne<SearchOptions>;
// name, email, phone 중 최소 하나는 필수
```

---

## 8. discriminated union 패턴

공통 리터럴 필드를 통해 유니온 타입을 안전하게 구분합니다.

```ts
// 네트워크 요청 상태 모델링
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function UserProfile() {
  const [state, setState] = useState<RequestState<User>>({ status: 'idle' });

  // TypeScript가 각 케이스에서 정확한 타입을 추론
  switch (state.status) {
    case 'idle':    return <div>시작하려면 클릭하세요</div>;
    case 'loading': return <Spinner />;
    case 'success': return <div>{state.data.name}</div>; // data: User
    case 'error':   return <div>{state.error.message}</div>; // error: Error
  }
}

// 완전성 검사 (exhaustive check)
function assertNever(x: never): never {
  throw new Error(`처리되지 않은 케이스: ${JSON.stringify(x)}`);
}

function handleState(state: RequestState<User>) {
  switch (state.status) {
    case 'idle': return '대기 중';
    case 'loading': return '로딩 중';
    case 'success': return state.data.name;
    case 'error': return state.error.message;
    default: return assertNever(state); // 누락된 케이스 컴파일 오류
  }
}
```

---

## 9. 실전 타입 패턴 모음

### API 클라이언트 타입 안전성

```ts
// 엔드포인트별 요청/응답 타입 매핑
interface ApiEndpoints {
  '/users': {
    GET: { response: User[] };
    POST: { body: Omit<User, 'id'>; response: User };
  };
  '/users/:id': {
    GET: { params: { id: string }; response: User };
    PUT: { params: { id: string }; body: Partial<User>; response: User };
    DELETE: { params: { id: string }; response: void };
  };
}

// 타입 안전한 fetch 래퍼
async function apiCall<
  Path extends keyof ApiEndpoints,
  Method extends keyof ApiEndpoints[Path]
>(
  path: Path,
  method: Method,
  options?: ApiEndpoints[Path][Method] extends { body: infer B } ? { body: B } : never
): Promise<ApiEndpoints[Path][Method] extends { response: infer R } ? R : never> {
  // 구현...
  return fetch(path, { method: method as string }).then(r => r.json());
}

// 완벽한 타입 추론
const users = await apiCall('/users', 'GET');            // User[]
const user = await apiCall('/users/:id', 'GET');         // User
// await apiCall('/users', 'DELETE'); // 컴파일 오류!
```

### 폼 유효성 검사 타입

```ts
type ValidationRule<T> = {
  required?: boolean;
  validate?: (value: T) => string | undefined;
};

type FormSchema<T extends Record<string, unknown>> = {
  [K in keyof T]: ValidationRule<T[K]>;
};

type FormErrors<T> = Partial<Record<keyof T, string>>;

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

const schema: FormSchema<LoginForm> = {
  email: {
    required: true,
    validate: (v) => (/^[^@]+@[^@]+/.test(v) ? undefined : '올바른 이메일'),
  },
  password: {
    required: true,
    validate: (v) => (v.length >= 8 ? undefined : '8자 이상 입력'),
  },
  rememberMe: {},
};
```

---

## 10. 타입 디버깅 팁

### Prettify — 교차 타입 인라인 전개

```ts
// 교차 타입은 IDE에서 읽기 어렵게 표시됨
type A = { name: string } & { age: number };
// hover 시: { name: string } & { age: number }

// Prettify로 펼쳐서 보기
type Prettify<T> = { [K in keyof T]: T[K] } & {};

type PrettyA = Prettify<A>;
// hover 시: { name: string; age: number }
```

### 타입 검사 유틸리티

```ts
// 두 타입이 동일한지 컴파일 타임에 확인
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;

type CheckString = Equals<string, string>; // true
type CheckMismatch = Equals<string, number>; // false

// 타입 테스트 (타입 유닛 테스트)
type Assert<T extends true> = T;

type Tests = [
  Assert<Equals<ReturnType<typeof getProperty<User, 'name'>>, string>>,
  Assert<Equals<ElementType<string[]>, string>>,
];
```

### `satisfies` 연산자 (TS 4.9+)

```ts
// as const처럼 타입 좁히기 + 타입 검사 동시에
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
  blue: [0, 0, 255],
} satisfies Record<string, string | number[]>;

// satisfies 없이는: palette.green은 string | number[]
// satisfies 사용 시: palette.green은 string (자동으로 좁혀짐)
palette.green.toUpperCase(); // OK — string으로 추론
palette.red.map(v => v * 2); // OK — number[]로 추론
```

---

TypeScript 고급 타입은 처음엔 어렵게 느껴지지만, `infer`와 조건부 타입을 이해하면 런타임에서야 발견하던 버그를 컴파일 타임에 잡을 수 있습니다. `Prettify`, `DeepPartial`, `RequireAtLeastOne` 같은 커스텀 유틸리티 타입을 팀의 공유 타입 파일에 모아두고 재사용하세요. 타입 자체가 문서가 되는 코드를 작성하는 것이 TypeScript 숙달의 핵심입니다.
