---
title: Backend Core Concepts
date: 2026-03-02
summary: Backend Core Concepts를 정리한 글 입니다.
tags: [HTTP, API, WAS, SQL]
---

# Backend Core Concepts

> 작성일: 2026-03-02 | HTTP/1.1·HTTP/2·HTTP/3, REST·GraphQL, SQL, 인증/보안, 배포 기준

---

## 목차

1. [HTTP / API](#1-http--api)
2. [WAS](#2-was)
3. [SQL](#3-sql)
4. [인증 / 보안](#4-인증--보안)
5. [배포 / 에러 대응](#5-배포--에러-대응)

---

## 1. HTTP / API

### HTTP 기본 구조

**요청 (Request):**

```
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer <token>

{"name": "Alice", "email": "alice@example.com"}
```

**응답 (Response):**

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/users/42

{"id": 42, "name": "Alice", "email": "alice@example.com"}
```

### HTTP 메서드

| 메서드 | 의미 | 멱등성 | 안전성 | 사용 예 |
|--------|------|--------|--------|---------|
| **GET** | 조회 | O | O | 리소스 읽기 |
| **POST** | 생성 | X | X | 새 리소스 생성, 액션 실행 |
| **PUT** | 전체 교체 | O | X | 리소스 완전 교체 |
| **PATCH** | 부분 수정 | △ | X | 특정 필드만 변경 |
| **DELETE** | 삭제 | O | X | 리소스 삭제 |
| **HEAD** | 헤더만 조회 | O | O | 메타데이터 확인 |
| **OPTIONS** | 허용 메서드 조회 | O | O | CORS preflight |

> **멱등성**: 같은 요청을 여러 번 보내도 결과가 동일한 성질
> **안전성**: 서버 상태를 변경하지 않는 성질

### HTTP 상태 코드

```
2xx — 성공
├── 200 OK              → GET, PUT, PATCH 성공
├── 201 Created         → POST로 리소스 생성
├── 204 No Content      → 성공했지만 응답 바디 없음 (DELETE 등)
└── 206 Partial Content → Range 요청 (동영상 스트리밍)

3xx — 리다이렉션
├── 301 Moved Permanently → URL 영구 변경 (SEO 영향)
├── 302 Found             → 임시 리다이렉트
├── 304 Not Modified      → 캐시 유효, 바디 없이 반환
└── 307 Temporary Redirect → 302 + 메서드 유지 보장

4xx — 클라이언트 오류
├── 400 Bad Request     → 잘못된 요청 형식/파라미터
├── 401 Unauthorized    → 인증 필요 (미인증)
├── 403 Forbidden       → 인증됐지만 권한 없음
├── 404 Not Found       → 리소스 없음
├── 405 Method Not Allowed → 허용되지 않는 메서드
├── 409 Conflict        → 리소스 충돌 (중복 등록 등)
├── 422 Unprocessable Entity → 유효성 검사 실패
└── 429 Too Many Requests   → 레이트 리밋 초과

5xx — 서버 오류
├── 500 Internal Server Error → 서버 내부 오류
├── 502 Bad Gateway           → 업스트림 서버 오류
├── 503 Service Unavailable   → 서버 과부하/점검
└── 504 Gateway Timeout       → 업스트림 응답 시간 초과
```

### HTTP 버전 비교

| 버전 | 핵심 특징 | 전송 방식 |
|------|-----------|-----------|
| **HTTP/1.1** | Keep-Alive, 청크 전송 | TCP, 텍스트 |
| **HTTP/2** | 멀티플렉싱, 헤더 압축(HPACK), 서버 푸시 | TCP, 이진 프레이밍 |
| **HTTP/3** | QUIC 기반, 0-RTT, HOL 블로킹 제거 | UDP(QUIC) |

```
HTTP/1.1: 요청 → 응답 → 요청 → 응답  (순차, HOL 블로킹 있음)
HTTP/2:   요청1 ──────────────── 응답1
          요청2 ─────── 응답2          (같은 커넥션에서 병렬)
          요청3 ─ 응답3
HTTP/3:   스트림 단위 독립 전송 (패킷 손실 시 해당 스트림만 영향)
```

### HTTP 헤더 주요 항목

**요청 헤더:**

```
Accept: application/json                     # 원하는 응답 타입
Accept-Encoding: gzip, br                   # 지원하는 압축
Authorization: Bearer eyJhbGc...            # 인증 토큰
Cache-Control: no-cache                     # 캐시 지시어
Content-Type: application/json              # 요청 바디 타입
If-None-Match: "abc123"                     # 조건부 요청 (ETag)
If-Modified-Since: Wed, 01 Jan 2025 00:00:00 GMT
```

**응답 헤더:**

```
Cache-Control: max-age=3600, public         # 캐시 유효 시간
Content-Encoding: gzip                      # 적용된 압축
ETag: "abc123"                              # 리소스 버전 식별자
Last-Modified: Wed, 01 Jan 2025 00:00:00 GMT
Set-Cookie: session=xyz; HttpOnly; Secure; SameSite=Strict
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 43
```

### RESTful API 설계

**URI 설계 원칙:**

```
# 리소스는 명사, 복수형
GET    /api/users          # 목록 조회
POST   /api/users          # 생성
GET    /api/users/:id      # 단건 조회
PUT    /api/users/:id      # 전체 수정
PATCH  /api/users/:id      # 부분 수정
DELETE /api/users/:id      # 삭제

# 중첩 리소스 (관계 표현)
GET    /api/users/:id/posts          # 특정 유저의 게시글
POST   /api/users/:id/posts          # 특정 유저에 게시글 생성
GET    /api/users/:id/posts/:postId  # 특정 유저의 특정 게시글

# 행위가 필요한 경우 (예외적 동사 허용)
POST   /api/users/:id/activate
POST   /api/auth/logout
POST   /api/payments/:id/refund
```

**쿼리 파라미터 패턴:**

```
# 필터링
GET /api/products?category=electronics&minPrice=10000&maxPrice=50000

# 정렬
GET /api/products?sort=price&order=asc

# 페이지네이션
GET /api/products?page=2&limit=20         # 오프셋 방식
GET /api/products?cursor=eyJpZCI6MTB9     # 커서 방식 (대용량 권장)

# 필드 선택 (Sparse Fieldsets)
GET /api/users?fields=id,name,email
```

**오프셋 vs 커서 페이지네이션:**

| 방식 | 장점 | 단점 | 적합 사례 |
|------|------|------|-----------|
| 오프셋 | 구현 간단, 랜덤 페이지 접근 | 중간 데이터 변경 시 누락/중복 | 어드민, 정적 데이터 |
| 커서 | 실시간 데이터 정확, 성능 우수 | 랜덤 접근 불가 | 피드, 무한스크롤 |

**응답 형식 표준화:**

```json
// 성공 응답
{
  "data": {
    "id": 1,
    "name": "Alice"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-03-01T00:00:00Z"
  }
}

// 목록 응답 (페이지네이션 포함)
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "nextCursor": "eyJpZCI6MjB9"
  }
}

// 에러 응답
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 값이 올바르지 않습니다",
    "details": [
      { "field": "email", "message": "유효한 이메일 주소를 입력해주세요" }
    ]
  }
}
```

### GraphQL vs REST

| 항목 | REST | GraphQL |
|------|------|---------|
| 데이터 형태 | 서버 고정 | 클라이언트 요청 |
| 엔드포인트 | 리소스별 여러 개 | 단일 (`/graphql`) |
| Over-fetching | 있음 | 없음 |
| Under-fetching | N+1 발생 가능 | 단일 요청으로 해결 |
| 캐싱 | HTTP 캐시 자연스러움 | 별도 구현 필요 |
| 파일 업로드 | 간단 | 복잡 |
| 러닝 커브 | 낮음 | 높음 |

```graphql
# GraphQL 예시
query GetUserWithPosts($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    posts(first: 5, orderBy: { createdAt: DESC }) {
      edges {
        node {
          id
          title
          createdAt
        }
      }
    }
  }
}
```

### API 버전 관리

```
# 1. URL 경로 방식 (가장 일반적)
/api/v1/users
/api/v2/users

# 2. 헤더 방식
Accept: application/vnd.example.v2+json

# 3. 쿼리 파라미터 방식
/api/users?version=2
```

**하위 호환성 원칙:**

- 필드 추가: 하위 호환 (OK)
- 필드 제거/타입 변경: 새 버전 필요
- Deprecation 헤더 활용: `Sunset: Sat, 01 Jan 2027 00:00:00 GMT`

### WebSocket vs SSE vs Long Polling

| 방식 | 방향 | 연결 | 적합 사례 |
|------|------|------|-----------|
| **WebSocket** | 양방향 | 영구 | 채팅, 게임, 실시간 협업 |
| **SSE** | 서버→클라이언트 단방향 | 영구 | 알림, 뉴스피드, 진행률 |
| **Long Polling** | 단방향 | 반영구 | SSE 미지원 환경 폴백 |

```js
// SSE 클라이언트
const es = new EventSource('/api/events')
es.onmessage = (e) => console.log(JSON.parse(e.data))
es.addEventListener('notification', (e) => handleNotification(e.data))
es.onerror = () => es.close()

// WebSocket 클라이언트
const ws = new WebSocket('wss://api.example.com/ws')
ws.onopen    = () => ws.send(JSON.stringify({ type: 'JOIN', room: 'general' }))
ws.onmessage = (e) => handleMessage(JSON.parse(e.data))
ws.onclose   = (e) => reconnect(e.code)
```

---

## 2. WAS

### WAS 개요

```
클라이언트
    │
    ▼
[로드 밸런서]  ← 트래픽 분산, 헬스체크
    │
    ▼
[웹 서버 (Nginx)]  ← 정적 파일 서빙, SSL 종료, 프록시
    │
    ▼
[WAS (Node.js / Spring / Django)]  ← 비즈니스 로직, API 처리
    │
    ├──▶ [캐시 (Redis)]       ← 세션, 자주 조회하는 데이터
    ├──▶ [메시지 큐 (Kafka)]  ← 비동기 작업, 이벤트 스트림
    └──▶ [DB (PostgreSQL)]    ← 영속 데이터
```

### Nginx 핵심 설정

```nginx
# /etc/nginx/sites-available/api.example.com

upstream api_servers {
    least_conn;                          # 최소 연결 부하분산
    server 10.0.0.1:3000 weight=3;
    server 10.0.0.2:3000 weight=2;
    server 10.0.0.3:3000 backup;        # 나머지 실패 시 사용
    keepalive 32;                        # 업스트림 커넥션 재사용
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate     /etc/ssl/certs/api.crt;
    ssl_certificate_key /etc/ssl/private/api.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_session_cache   shared:SSL:10m;

    # 보안 헤더
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip 압축
    gzip on;
    gzip_types application/json text/plain application/javascript text/css;
    gzip_min_length 1024;

    location /api/ {
        proxy_pass         http://api_servers;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        proxy_connect_timeout 5s;
        proxy_read_timeout    30s;

        # 레이트 리밋
        limit_req zone=api burst=20 nodelay;
    }

    location /static/ {
        root /var/www;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$host$request_uri;
}

# 레이트 리밋 존 정의 (http 블록)
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
```

### Node.js WAS 구조 (Express 기준)

```
src/
├── app.ts               # Express 앱 설정, 미들웨어 등록
├── server.ts            # HTTP 서버 시작, graceful shutdown
├── routes/
│   ├── index.ts
│   ├── users.route.ts
│   └── auth.route.ts
├── controllers/         # 요청/응답 처리 (thin layer)
│   └── users.controller.ts
├── services/            # 비즈니스 로직
│   └── users.service.ts
├── repositories/        # DB 접근 계층
│   └── users.repository.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validate.middleware.ts
├── models/              # DB 모델/스키마
└── utils/
```

```ts
// app.ts
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { json } from 'body-parser'
import { errorHandler } from './middlewares/error.middleware'

const app = express()

// 보안 미들웨어
app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }))

// 파싱
app.use(json({ limit: '10mb' }))

// 라우트
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/auth', authRouter)

// 에러 핸들러 (마지막에 등록)
app.use(errorHandler)

export default app
```

```ts
// server.ts — Graceful Shutdown
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const shutdown = async () => {
  server.close(async () => {        // 신규 요청 거부
    await db.disconnect()           // DB 연결 해제
    await redis.quit()              // 캐시 연결 해제
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000) // 10초 타임아웃
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
```

### 미들웨어 패턴

```ts
// 에러 처리 미들웨어
import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message)
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message }
    })
  }

  // 예상치 못한 에러
  console.error('[Unhandled Error]', err)
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' }
  })
}

// 유효성 검사 미들웨어 (Zod 사용)
import { z } from 'zod'

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    email: z.string().email(),
    age: z.number().int().min(0).max(150).optional(),
  })
})

export function validate(schema: z.AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params })
    if (!result.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: '입력값을 확인해주세요',
          details: result.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message
          }))
        }
      })
    }
    next()
  }
}
```

### 캐싱 전략

```
캐시 계층:
클라이언트 캐시 → CDN 캐시 → 서버 메모리 캐시 → Redis → DB
```

```ts
// Redis 캐싱 패턴

// 1. Cache-Aside (Lazy Loading) — 가장 일반적
async function getUser(id: string) {
  const cached = await redis.get(`user:${id}`)
  if (cached) return JSON.parse(cached)

  const user = await db.user.findUnique({ where: { id } })
  if (user) await redis.setex(`user:${id}`, 3600, JSON.stringify(user)) // 1시간 TTL
  return user
}

// 2. Write-Through — 쓰기 시 캐시도 동시 업데이트
async function updateUser(id: string, data: Partial<User>) {
  const user = await db.user.update({ where: { id }, data })
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user))
  return user
}

// 3. 캐시 무효화
async function deleteUser(id: string) {
  await db.user.delete({ where: { id } })
  await redis.del(`user:${id}`)
  await redis.del('users:list') // 관련 목록 캐시도 무효화
}

// 4. 분산 락 (캐시 스탬피드 방지)
async function getUserWithLock(id: string) {
  const cached = await redis.get(`user:${id}`)
  if (cached) return JSON.parse(cached)

  const lockKey = `lock:user:${id}`
  const acquired = await redis.set(lockKey, '1', 'EX', 5, 'NX') // 5초 락
  if (!acquired) {
    await new Promise(r => setTimeout(r, 100)) // 잠시 대기 후 재시도
    return getUserWithLock(id)
  }

  try {
    const user = await db.user.findUnique({ where: { id } })
    if (user) await redis.setex(`user:${id}`, 3600, JSON.stringify(user))
    return user
  } finally {
    await redis.del(lockKey)
  }
}
```

### 메시지 큐

```
동기 처리:  클라이언트 → API → DB → 클라이언트  (느린 작업이면 타임아웃 위험)
비동기 처리: 클라이언트 → API → MQ → Worker → DB
                              ↓
                          클라이언트에 즉시 응답 (202 Accepted)
```

```ts
// Bull (Redis 기반 큐) 예시
import Queue from 'bull'

const emailQueue = new Queue('email', { redis: { host: 'localhost', port: 6379 } })

// Producer: 작업 추가
await emailQueue.add(
  { to: 'user@example.com', template: 'welcome' },
  {
    attempts: 3,           // 실패 시 재시도 횟수
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
  }
)

// Consumer: 작업 처리
emailQueue.process(async (job) => {
  await sendEmail(job.data.to, job.data.template)
})

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err)
  // Sentry 등에 에러 리포트
})
```

### 레이트 리밋

```ts
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'

// API 전체 레이트 리밋
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1분
  max: 100,             // 최대 100회
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ client: redis }), // 분산 환경에서 Redis 사용
  keyGenerator: (req) => req.headers['x-real-ip'] as string || req.ip,
  handler: (req, res) => res.status(429).json({
    error: { code: 'RATE_LIMIT_EXCEEDED', message: '잠시 후 다시 시도해주세요' }
  })
})

// 로그인 강화 제한
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10,                   // 10회
})

app.use('/api/', apiLimiter)
app.post('/api/auth/login', loginLimiter, loginController)
```

---

## 3. SQL

### 인덱스

**B-Tree 인덱스 (기본):**

```sql
-- 단일 컬럼 인덱스
CREATE INDEX idx_users_email ON users(email);

-- 복합 인덱스 (왼쪽 접두사 규칙)
CREATE INDEX idx_orders_user_status ON orders(user_id, status, created_at);
-- 사용 가능: WHERE user_id = 1
-- 사용 가능: WHERE user_id = 1 AND status = 'pending'
-- 사용 가능: WHERE user_id = 1 AND status = 'pending' AND created_at > '2026-01-01'
-- 사용 불가: WHERE status = 'pending'  (user_id 없이)

-- 유니크 인덱스
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- 부분 인덱스 (조건부 인덱스)
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';  -- pending 건만 인덱싱 → 크기 감소
```

**인덱스 선택 기준:**

```
인덱스 추가 고려 → WHERE, JOIN ON, ORDER BY, GROUP BY 컬럼
인덱스 비효율   → 선택성 낮은 컬럼 (성별 등), 쓰기 많은 테이블
카디널리티가 높을수록 인덱스 효과 좋음 (email > status > gender)
```

### EXPLAIN 분석

```sql
-- 실행 계획 확인
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2026-01-01'
GROUP BY u.id, u.name;

-- 결과 핵심 항목
-- Seq Scan      → 전체 테이블 스캔 (인덱스 없음) — 대용량 시 위험
-- Index Scan    → 인덱스 사용 후 테이블 접근
-- Index Only Scan → 인덱스만으로 쿼리 해결 (커버링 인덱스)
-- Hash Join     → 큰 테이블 조인
-- Nested Loop   → 작은 테이블 조인
-- rows          → 예상 처리 행 수
-- actual rows   → 실제 처리 행 수 (크게 다르면 통계 갱신 필요)
-- cost          → 예상 비용
-- actual time   → 실제 실행 시간 (ms)
```

### JOIN 종류

```sql
-- INNER JOIN: 양쪽 모두 일치하는 행만
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN: 왼쪽 테이블 전체 + 오른쪽 일치 행 (없으면 NULL)
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;  -- 주문 없는 유저도 포함

-- RIGHT JOIN: 오른쪽 테이블 전체 (LEFT JOIN으로 대체 가능)

-- FULL OUTER JOIN: 양쪽 모두 포함
SELECT u.name, o.total
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;

-- CROSS JOIN: 카르테시안 곱 (행 수 = A × B)
-- N+1 문제 해결: 서브쿼리 대신 JOIN 사용
-- BAD: 루프 내 각 user마다 쿼리 실행 → N+1
-- GOOD: 단일 JOIN으로 처리
SELECT u.id, u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
```

### 윈도우 함수

```sql
-- ROW_NUMBER: 파티션 내 순번
SELECT
  user_id,
  order_id,
  total,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
FROM orders;

-- 각 유저의 최신 주문만 조회
WITH ranked_orders AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
  FROM orders
)
SELECT * FROM ranked_orders WHERE rn = 1;

-- RANK vs DENSE_RANK
-- RANK:       1, 2, 2, 4  (동점 시 다음 순위 건너뜀)
-- DENSE_RANK: 1, 2, 2, 3  (동점 시 다음 순위 연속)

-- LAG / LEAD: 이전/다음 행 값 참조
SELECT
  date,
  revenue,
  LAG(revenue) OVER (ORDER BY date) AS prev_revenue,
  revenue - LAG(revenue) OVER (ORDER BY date) AS revenue_change
FROM daily_revenue;

-- 누적 합계
SELECT
  date,
  revenue,
  SUM(revenue) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative
FROM daily_revenue;
```

### CTE (Common Table Expression)

```sql
-- 기본 CTE
WITH active_users AS (
  SELECT id, name, email
  FROM users
  WHERE is_active = true AND last_login > NOW() - INTERVAL '30 days'
),
user_stats AS (
  SELECT user_id, COUNT(*) AS order_count, SUM(total) AS total_spent
  FROM orders
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT
  u.name,
  u.email,
  COALESCE(s.order_count, 0) AS order_count,
  COALESCE(s.total_spent, 0) AS total_spent
FROM active_users u
LEFT JOIN user_stats s ON u.id = s.user_id
ORDER BY total_spent DESC;

-- 재귀 CTE (계층 구조)
WITH RECURSIVE category_tree AS (
  -- 앵커: 루트 카테고리
  SELECT id, name, parent_id, 0 AS depth, name::TEXT AS path
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  -- 재귀: 자식 카테고리
  SELECT c.id, c.name, c.parent_id, ct.depth + 1, (ct.path || ' > ' || c.name)::TEXT
  FROM categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY path;
```

### 트랜잭션과 격리 수준

```sql
-- 트랜잭션 기본
BEGIN;
  UPDATE accounts SET balance = balance - 10000 WHERE id = 1;
  UPDATE accounts SET balance = balance + 10000 WHERE id = 2;
  -- 두 UPDATE 모두 성공해야 COMMIT
COMMIT;
-- 실패 시
ROLLBACK;
```

**격리 수준 비교:**

| 격리 수준 | Dirty Read | Non-Repeatable Read | Phantom Read | 용도 |
|-----------|-----------|---------------------|--------------|------|
| READ UNCOMMITTED | 발생 | 발생 | 발생 | (거의 사용 안 함) |
| READ COMMITTED | 방지 | 발생 | 발생 | PostgreSQL 기본값 |
| REPEATABLE READ | 방지 | 방지 | 발생 | MySQL InnoDB 기본값 |
| SERIALIZABLE | 방지 | 방지 | 방지 | 금융, 재고 |

```sql
-- 격리 수준 설정
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
-- ...

-- 낙관적 락 (충돌 드물 때)
-- version 컬럼으로 충돌 감지
UPDATE products
SET stock = stock - 1, version = version + 1
WHERE id = 42 AND version = 7 AND stock > 0;
-- affected rows = 0 이면 충돌 → 애플리케이션에서 재시도

-- 비관적 락 (충돌 빈번할 때)
BEGIN;
SELECT * FROM products WHERE id = 42 FOR UPDATE; -- 다른 트랜잭션 대기
UPDATE products SET stock = stock - 1 WHERE id = 42;
COMMIT;
```

### 쿼리 최적화 패턴

```sql
-- 1. SELECT * 대신 필요한 컬럼만
-- BAD
SELECT * FROM users WHERE id = 1;
-- GOOD
SELECT id, name, email FROM users WHERE id = 1;

-- 2. LIMIT으로 대용량 조회 방지
SELECT id, name FROM users ORDER BY created_at DESC LIMIT 20 OFFSET 0;

-- 3. 커버링 인덱스 (인덱스만으로 쿼리 해결)
CREATE INDEX idx_users_email_name ON users(email, name);
SELECT name FROM users WHERE email = 'alice@example.com';
-- Index Only Scan 발생 → 테이블 접근 없음

-- 4. 서브쿼리 → JOIN으로 변환 (성능 향상)
-- BAD: 상관 서브쿼리 (행마다 실행)
SELECT name FROM users u
WHERE (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) > 5;

-- GOOD: JOIN + 집계
SELECT u.name FROM users u
JOIN (
  SELECT user_id, COUNT(*) AS cnt FROM orders GROUP BY user_id
) o ON u.id = o.user_id AND o.cnt > 5;

-- 5. BETWEEN으로 범위 검색 최적화
SELECT * FROM orders
WHERE created_at BETWEEN '2026-01-01' AND '2026-01-31 23:59:59';

-- 6. EXISTS vs IN (대용량 서브쿼리)
-- EXISTS: 조건 만족하는 첫 행을 찾으면 즉시 종료 → 대용량에 유리
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 'pending');
```

### 스키마 설계 원칙

```sql
-- 정규화 (3NF 기준)
-- 1NF: 원자값, 중복 행 없음
-- 2NF: 부분 함수 종속 제거 (복합키의 일부에만 종속된 컬럼 분리)
-- 3NF: 이행 함수 종속 제거 (비키 컬럼 간 종속 제거)

-- 실무: 읽기 성능 위해 의도적 비정규화 허용 (집계 컬럼 등)
-- users.post_count = posts 테이블에서 COUNT하지 않고 캐싱

-- 소프트 딜리트 (실제 삭제 대신 플래그)
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
-- 조회 시 WHERE deleted_at IS NULL 조건 추가
-- 부분 인덱스로 삭제된 행 인덱스에서 제외
CREATE INDEX idx_users_active ON users(email) WHERE deleted_at IS NULL;

-- Audit 컬럼 표준화
ALTER TABLE users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 4. 인증 / 보안

### 인증 vs 인가

```
인증 (Authentication): 당신이 누구인지 확인 → "로그인"
인가 (Authorization):  당신에게 권한이 있는지 확인 → "접근 제어"
```

### JWT (JSON Web Token)

```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← Base64 인코딩된 헤더
.eyJzdWIiOiJ1c2VyXzEyMyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMzYwMDB9
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

```ts
import jwt from 'jsonwebtoken'

// Access Token 생성 (짧은 만료)
function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m', issuer: 'api.example.com' }
  )

  const refreshToken = jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

// 토큰 검증 미들웨어
function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: { code: 'UNAUTHORIZED' } })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.user = { id: payload.sub!, role: payload.role }
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: { code: 'TOKEN_EXPIRED' } })
    }
    return res.status(401).json({ error: { code: 'INVALID_TOKEN' } })
  }
}
```

**JWT 저장 위치 비교:**

| 저장소 | XSS | CSRF | 자동 전송 | 권장도 |
|--------|-----|------|-----------|--------|
| localStorage | 취약 | 안전 | 수동 | 비권장 |
| sessionStorage | 취약 | 안전 | 수동 | 비권장 |
| HttpOnly Cookie | 안전 | 취약 | 자동 | 권장 (CSRF 방어 추가) |
| 메모리 (변수) | 안전 | 안전 | 수동 | 권장 (새로고침 시 소실) |

**권장 패턴:** Access Token → 메모리, Refresh Token → HttpOnly Secure Cookie

### 세션 기반 인증

```ts
import session from 'express-session'
import RedisStore from 'connect-redis'

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET!,
  name: '__Host-sid',            // __Host- prefix: HTTPS + Path=/ 강제
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,              // JS 접근 차단
    secure: true,                // HTTPS만 전송
    sameSite: 'strict',          // CSRF 방어
    maxAge: 24 * 60 * 60 * 1000  // 24시간
  }
}))

// 로그인
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  const user = await verifyCredentials(email, password)
  if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' })

  req.session.userId = user.id    // 세션에 저장
  req.session.role = user.role
  res.json({ id: user.id, name: user.name })
})

// 로그아웃
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie('__Host-sid')
    res.json({ success: true })
  })
})
```

### OAuth 2.0 / OIDC 플로우

```
Authorization Code Flow (권장):

1. 클라이언트 → 인가 서버: 로그인 요청
   GET /oauth/authorize?response_type=code&client_id=...&redirect_uri=...&scope=openid profile&state=random123

2. 사용자 로그인 + 동의

3. 인가 서버 → 클라이언트: 인가 코드 전달
   GET /callback?code=AUTH_CODE&state=random123

4. 클라이언트 → 인가 서버: 코드로 토큰 교환 (서버 사이드)
   POST /oauth/token
   { code, client_id, client_secret, redirect_uri }

5. 인가 서버 → 클라이언트: Access Token + ID Token(OIDC)

6. 클라이언트 → 리소스 서버: API 호출
   Authorization: Bearer ACCESS_TOKEN
```

```ts
// PKCE (Public clients용: SPA, 모바일)
import crypto from 'crypto'

function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

const { verifier, challenge } = generatePKCE()
// 인가 요청 시 code_challenge 전송
// 토큰 교환 시 code_verifier 전송 → 서버에서 검증
```

### 비밀번호 보안

```ts
import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'

const SALT_ROUNDS = 12  // 2^12 = 4096 해시 반복

// 비밀번호 해시
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// 비밀번호 검증 (타이밍 공격 방지: bcrypt가 constant time compare 사용)
async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// NEVER: MD5, SHA1, SHA256 단독 사용 (레인보우 테이블 취약)
// GOOD: bcrypt, argon2, scrypt
```

### CSRF 방어

```ts
import csurf from 'csurf'

// 1. Double Submit Cookie 방식
const csrfProtection = csurf({
  cookie: { httpOnly: false, sameSite: 'strict', secure: true }
})

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// 클라이언트: X-CSRF-Token 헤더로 전송
// POST 요청 시 서버에서 헤더 검증

// 2. SameSite=Strict Cookie (가장 간단)
// Cookie에 SameSite=Strict 설정만으로 대부분 방어
```

### XSS 방어

```ts
// 1. 출력 인코딩 (HTML)
import { escape } from 'html-escaper'
const safeOutput = escape(userInput)  // < > & " ' 인코딩

// 2. Content-Security-Policy 헤더
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'nonce-RANDOM_NONCE'",  // 인라인 스크립트 차단
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://cdn.example.com data:",
    "connect-src 'self' https://api.example.com",
    "frame-ancestors 'none'",                   // Clickjacking 방어
    "upgrade-insecure-requests"
  ].join('; '))
  next()
})

// 3. 사용자 입력 HTML 허용 시 → DOMPurify (화이트리스트 방식)
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
const DOMPurify = createDOMPurify(new JSDOM('').window as any)
const clean = DOMPurify.sanitize(dirtyHtml, { ALLOWED_TAGS: ['b', 'i', 'p', 'br'] })
```

### SQL 인젝션 방어

```ts
// NEVER: 문자열 직접 삽입
const query = `SELECT * FROM users WHERE email = '${email}'`  // XSS 취약

// GOOD: 파라미터 바인딩 (Prepared Statement)
const user = await db.query('SELECT * FROM users WHERE email = $1', [email])

// ORM 사용 시 자동으로 파라미터 바인딩
const user = await prisma.user.findUnique({ where: { email } })
```

### RBAC (역할 기반 접근 제어)

```ts
// 역할 계층
enum Role { GUEST, USER, MODERATOR, ADMIN }

const permissions = {
  [Role.USER]: ['read:posts', 'create:posts', 'update:own_posts'],
  [Role.MODERATOR]: ['read:posts', 'create:posts', 'update:any_posts', 'delete:posts'],
  [Role.ADMIN]: ['*'],  // 모든 권한
}

function authorize(...requiredPerms: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPerms = permissions[req.user.role] ?? []
    const hasAll = requiredPerms.every(
      perm => userPerms.includes('*') || userPerms.includes(perm)
    )
    if (!hasAll) return res.status(403).json({ error: { code: 'FORBIDDEN' } })
    next()
  }
}

// 사용
router.delete('/posts/:id', verifyToken, authorize('delete:posts'), deletePost)
```

### 보안 체크리스트

- [ ] 모든 비밀번호 bcrypt/argon2로 해시 (절대 평문 저장 X)
- [ ] HTTPS 강제 (HSTS 헤더)
- [ ] HttpOnly + Secure + SameSite Cookie
- [ ] JWT 시크릿 최소 256비트, 환경변수로 관리
- [ ] SQL 파라미터 바인딩 (Prepared Statement)
- [ ] XSS: 출력 인코딩 + CSP 헤더
- [ ] CSRF: SameSite=Strict 또는 CSRF 토큰
- [ ] 레이트 리밋 (특히 로그인, 비밀번호 재설정)
- [ ] 민감 정보 로그 제외 (비밀번호, 토큰, 카드번호)
- [ ] 의존성 취약점 주기적 스캔 (`npm audit`, Dependabot)
- [ ] 에러 응답에 스택 트레이스 노출 금지 (프로덕션)
- [ ] 파일 업로드: 확장자 + MIME 타입 검증, 저장 경로 격리

---

## 5. 배포 / 에러 대응

### CI/CD 파이프라인

```
코드 푸시 → CI 트리거
    │
    ├── 1. 린트 + 타입 체크
    ├── 2. 단위 테스트 + 커버리지
    ├── 3. 통합 테스트
    ├── 4. 보안 스캔 (npm audit, SAST)
    ├── 5. Docker 이미지 빌드
    ├── 6. 이미지 취약점 스캔
    └── 7. 레지스트리 푸시
            │
            ▼
       CD 트리거 (main 브랜치 머지 시)
            │
            ├── Staging 자동 배포
            ├── E2E 테스트
            └── Production 배포 (수동 승인 또는 자동)
```

**GitHub Actions 예시:**

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: --health-cmd pg_isready
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:test@localhost/test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production  # 수동 승인 환경
    steps:
      - run: |
          kubectl set image deployment/api \
            api=ghcr.io/${{ github.repository }}:${{ github.sha }}
          kubectl rollout status deployment/api
```

### Docker 최적화

```dockerfile
# 멀티스테이지 빌드 (최종 이미지 크기 최소화)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  # 의존성 설치
COPY . .
RUN npm run build             # 빌드

FROM node:20-alpine AS runner
WORKDIR /app

# 보안: 루트 실행 금지
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json .

USER appuser
EXPOSE 3000

# graceful shutdown 지원
STOPSIGNAL SIGTERM

# 헬스체크
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### 배포 전략

```
1. Rolling Update (점진적 교체)
   v1 v1 v1 v1
   v2 v1 v1 v1  ← 1개씩 교체
   v2 v2 v1 v1
   v2 v2 v2 v2
   장점: 무중단, 간단
   단점: v1/v2 동시 운영 중 호환성 필요

2. Blue/Green Deployment
   [Blue: v1] ←── 트래픽
   [Green: v2]    (대기)
       │
   [Green: v2] ←── 트래픽 전환 (즉시)
   [Blue: v1]    (롤백 대기)
   장점: 즉각 롤백, 완전한 환경 분리
   단점: 리소스 2배

3. Canary Release
   트래픽의 5% → v2 (카나리)
   트래픽의 95% → v1 (stale)
       │ 문제 없으면 단계적 증가
   트래픽의 100% → v2
   장점: 실제 트래픽으로 검증, 위험 최소화
   단점: 복잡한 설정, 부분 사용자 영향
```

### Kubernetes 핵심 설정

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1         # 최대 추가 파드 수
      maxUnavailable: 0   # 최소 사용 가능 파드 (무중단)
  selector:
    matchLabels:
      app: api
  template:
    spec:
      containers:
        - name: api
          image: ghcr.io/example/api:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: api-secrets
                  key: database-url
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:            # 트래픽 받을 준비 확인
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:             # 재시작 여부 판단
            httpGet:
              path: /health/live
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 5"]  # graceful shutdown 보장

---
# hpa.yaml — 자동 스케일링
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  scaleTargetRef:
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### 헬스체크 엔드포인트

```ts
// 헬스체크 구현
app.get('/health/live', (req, res) => {
  // Liveness: 프로세스가 살아있는지
  res.json({ status: 'ok' })
})

app.get('/health/ready', async (req, res) => {
  // Readiness: 트래픽 처리 가능한지
  const checks = await Promise.allSettled([
    db.$queryRaw`SELECT 1`,    // DB 연결
    redis.ping(),              // Redis 연결
  ])

  const failed = checks.filter(c => c.status === 'rejected')
  if (failed.length > 0) {
    return res.status(503).json({ status: 'unavailable' })
  }

  res.json({ status: 'ready' })
})
```

### 로깅 전략

```ts
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),  // 레벨 이름으로 출력
  },
  redact: ['body.password', 'headers.authorization', '*.creditCard'],  // 민감 정보 마스킹
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      requestId: req.id,
    }),
    res: (res) => ({ statusCode: res.statusCode }),
    err: pino.stdSerializers.err,
  }
})

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    logger.info({
      req,
      res,
      responseTime: Date.now() - start,
    }, 'HTTP request completed')
  })
  next()
})

// 로그 레벨 가이드
logger.fatal('서비스 즉시 중단 필요')  // 치명적 — 즉각 대응
logger.error({ err }, '주문 처리 실패')  // 에러 — 알림 발송
logger.warn('Redis 응답 3초 초과')       // 경고 — 모니터링
logger.info('서버 시작: port 3000')      // 정보 — 주요 이벤트
logger.debug({ query }, 'DB 쿼리 실행') // 디버그 — 개발 환경
```

**구조화 로깅 원칙:**

```json
{
  "level": "error",
  "timestamp": "2026-03-01T00:00:00.000Z",
  "requestId": "req_abc123",
  "userId": "user_456",
  "service": "order-service",
  "message": "결제 처리 실패",
  "error": {
    "name": "PaymentError",
    "message": "카드 한도 초과",
    "code": "CARD_LIMIT_EXCEEDED"
  },
  "orderId": "order_789",
  "amount": 50000
}
```

### 모니터링 / 알림

```
메트릭 수집 스택:
애플리케이션 → Prometheus (수집) → Grafana (시각화)

핵심 메트릭:
├── 인프라: CPU, 메모리, 디스크, 네트워크
├── 애플리케이션: 요청 수(RPS), 오류율, 응답 시간(P50/P95/P99)
├── 비즈니스: 회원가입 수, 주문 수, 결제 성공률
└── 의존성: DB 커넥션 풀, Redis 히트율, 외부 API 응답시간
```

```ts
// Prometheus 메트릭 수집 (prom-client)
import client from 'prom-client'

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP 요청 처리 시간',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
})

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'HTTP 요청 총 수',
  labelNames: ['method', 'route', 'status_code']
})

// 미들웨어로 자동 수집
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer()
  res.on('finish', () => {
    const labels = { method: req.method, route: req.route?.path ?? 'unknown', status_code: res.statusCode }
    end(labels)
    httpRequestTotal.inc(labels)
  })
  next()
})

// 메트릭 엔드포인트
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType)
  res.end(await client.register.metrics())
})
```

**알림 규칙 예시:**

```yaml
# Prometheus AlertManager
groups:
  - name: api-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "5xx 에러율 5% 초과"

      - alert: HighResponseTime
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P99 응답 시간 2초 초과"
```

### 에러 대응 (Incident Response)

**에러 분류 및 대응:**

| 심각도 | 정의 | 대응 시간 | 예시 |
|--------|------|-----------|------|
| P1 (Critical) | 전체 서비스 중단 | 즉시 | DB 연결 불가, 모든 API 500 |
| P2 (High) | 핵심 기능 장애 | 30분 | 결제 불가, 로그인 불가 |
| P3 (Medium) | 일부 기능 장애 | 4시간 | 특정 지역 느림, 알림 미발송 |
| P4 (Low) | 경미한 이슈 | 24시간 | UI 버그, 이미지 로딩 느림 |

**장애 대응 프로세스:**

```
1. 감지: 모니터링 알림 또는 사용자 신고
2. 초기 대응:
   ├── 장애 채널 생성 (#incident-2026-0301)
   ├── 담당자 지정 (Incident Commander)
   └── 사용자 공지 (Status Page 업데이트)
3. 원인 파악:
   ├── 로그 확인 (최근 배포? 트래픽 급증?)
   ├── 메트릭 확인 (CPU, 메모리, 에러율)
   └── 최근 변경사항 검토
4. 완화:
   ├── 롤백 (최근 배포가 원인인 경우)
   ├── 스케일 아웃 (트래픽 급증 시)
   ├── 기능 플래그 OFF (특정 기능 비활성화)
   └── 서킷 브레이커 발동
5. 해결 확인: 메트릭 정상화 확인
6. 사후 분석 (Post-mortem):
   ├── 타임라인 정리
   ├── 근본 원인 분석 (5 Whys)
   ├── 재발 방지 대책 수립
   └── 문서화 (비난 없이 시스템 개선에 집중)
```

### 서킷 브레이커

```
외부 서비스 장애 시 연쇄 장애 방지

Closed (정상) ──실패 임계치 초과──▶ Open (차단)
     ▲                                    │
     │                              타임아웃 후
Half-Open (탐색) ◀──────────────────────────┘
     │ (일부 요청 통과, 성공 시 Closed / 실패 시 Open)
```

```ts
import CircuitBreaker from 'opossum'

const paymentBreaker = new CircuitBreaker(callPaymentAPI, {
  timeout: 3000,            // 요청 타임아웃 3초
  errorThresholdPercentage: 50,  // 오류율 50% 이상 시 Open
  resetTimeout: 30000,      // 30초 후 Half-Open 시도
  volumeThreshold: 10,       // 최소 10회 요청 후 판단
})

paymentBreaker.fallback(() => {
  return { success: false, error: 'PAYMENT_SERVICE_UNAVAILABLE' }
})

paymentBreaker.on('open', () => logger.warn('결제 서비스 서킷 브레이커 Open'))
paymentBreaker.on('halfOpen', () => logger.info('결제 서비스 서킷 브레이커 Half-Open'))
paymentBreaker.on('close', () => logger.info('결제 서비스 서킷 브레이커 Close (정상 복구)'))

// 사용
const result = await paymentBreaker.fire(paymentData)
```

### 환경 변수 및 시크릿 관리

```bash
# .env.example (커밋: 예시만, 실제 값 X)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=your-256-bit-secret-here
REDIS_URL=redis://localhost:6379
```

```ts
// 환경 변수 검증 (앱 시작 시)
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url(),
})

const env = envSchema.parse(process.env)  // 실패 시 즉시 프로세스 종료

export default env
```

**시크릿 관리 도구:**

- **로컬 개발**: `.env` 파일 (`.gitignore`에 추가)
- **CI/CD**: GitHub Actions Secrets, GitLab CI Variables
- **프로덕션**: AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager

---

> **참고 자료**
>
> - [MDN HTTP 가이드](https://developer.mozilla.org/ko/docs/Web/HTTP)
> - [OWASP Top 10](https://owasp.org/www-project-top-ten)
> - [PostgreSQL 공식 문서](https://www.postgresql.org/docs)
> - [Kubernetes 공식 문서](https://kubernetes.io/docs)
> - [JWT 공식 사이트](https://jwt.io)
