---
title: Spring Security + JWT 완벽 가이드
date: 2026-04-04
summary: Spring Security 아키텍처부터 JWT 발급/검증, Refresh Token 전략, React 연동까지 실무에서 바로 쓰는 인증·인가 구현을 단계별로 정리한다.
tags: [Spring Boot, Spring Security, JWT, Java, 인증, 백엔드]
---

Spring Boot 애플리케이션에서 인증·인가를 구현할 때 가장 많이 쓰이는 조합이 **Spring Security + JWT**다. 세션 없이 Stateless하게 사용자를 인증하고, 마이크로서비스나 SPA와도 자연스럽게 연동된다. 이 글에서는 의존성 설정부터 Refresh Token 전략, React 프론트엔드 연동까지 실무 수준으로 다룬다.

> **목표:** Spring Security 필터 체인을 이해하고, JWT 기반 인증 서버를 직접 구현한다. Access Token / Refresh Token 이중 전략과 React axios 인터셉터 연동까지 완성한다.

## 목차

1. [Spring Security 아키텍처 이해](#1-spring-security-아키텍처-이해)
2. [JWT 기본 개념](#2-jwt-기본-개념)
3. [의존성 및 프로젝트 설정](#3-의존성-및-프로젝트-설정)
4. [SecurityConfig 설정](#4-securityconfig-설정)
5. [JWT 유틸리티 클래스 구현](#5-jwt-유틸리티-클래스-구현)
6. [JWT 인증 필터 구현](#6-jwt-인증-필터-구현)
7. [로그인 · 회원가입 API](#7-로그인--회원가입-api)
8. [Refresh Token 전략](#8-refresh-token-전략)
9. [Role 기반 권한 제어](#9-role-기반-권한-제어)
10. [React 연동 — axios 인터셉터](#10-react-연동--axios-인터셉터)
11. [실전 팁 및 주의사항](#11-실전-팁-및-주의사항)

---

## 1. Spring Security 아키텍처 이해

Spring Security는 **필터 체인(FilterChain)** 기반으로 동작한다. 요청이 들어오면 등록된 필터들이 순서대로 실행되며, 인증·인가를 처리한다.

```
HTTP Request
    ↓
[DelegatingFilterProxy]
    ↓
[SecurityFilterChain]
    ├── UsernamePasswordAuthenticationFilter
    ├── JwtAuthenticationFilter  ← 우리가 추가할 필터
    ├── ExceptionTranslationFilter
    └── FilterSecurityInterceptor
    ↓
DispatcherServlet → Controller
```

**핵심 컴포넌트**

| 컴포넌트 | 역할 |
|---------|------|
| `SecurityContextHolder` | 현재 인증된 사용자 정보 보관 (ThreadLocal) |
| `Authentication` | 인증 객체 (principal, credentials, authorities) |
| `AuthenticationManager` | 인증 처리 위임 |
| `UserDetailsService` | DB에서 사용자 정보 로드 |
| `PasswordEncoder` | 비밀번호 해시 처리 |

---

## 2. JWT 기본 개념

JWT(JSON Web Token)는 **Header.Payload.Signature** 세 부분으로 구성된다.

```
eyJhbGciOiJIUzI1NiJ9          ← Header  (알고리즘)
.eyJzdWIiOiJ1c2VyMSJ9         ← Payload (claims)
.SflKxwRJSMeKKF2QT4fwpMeJf36  ← Signature (검증용)
```

**Payload에 담는 Claims 예시**

```json
{
  "sub": "user@example.com",
  "roles": ["ROLE_USER"],
  "iat": 1712000000,
  "exp": 1712003600
}
```

**Access Token vs Refresh Token**

| 구분 | 만료 시간 | 저장 위치 | 용도 |
|------|----------|----------|------|
| Access Token | 15~30분 | 메모리 (JS 변수) | API 요청 인증 |
| Refresh Token | 7~30일 | HttpOnly Cookie | Access Token 재발급 |

> ⚠️ Access Token을 `localStorage`에 저장하면 XSS 공격에 취약하다. 메모리에 보관하고, Refresh Token은 HttpOnly Cookie를 사용할 것.

---

## 3. 의존성 및 프로젝트 설정

`build.gradle`

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

    // JWT (최신: io.jsonwebtoken 0.12.x)
    implementation 'io.jsonwebtoken:jjwt-api:0.12.6'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.6'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.6'

    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

`application.yml`

```yaml
jwt:
  secret: your-256-bit-secret-key-must-be-very-long-for-hs256
  access-expiration: 1800000      # 30분 (ms)
  refresh-expiration: 604800000   # 7일 (ms)

spring:
  security:
    user:
      name: ignored  # 기본 유저 비활성화
```

---

## 4. SecurityConfig 설정

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)          // JWT 사용 시 CSRF 불필요
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()  // 인증 엔드포인트 공개
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
        AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

---

## 5. JWT 유틸리티 클래스 구현

```java
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    // Access Token 생성
    public String generateAccessToken(String email, List<String> roles) {
        return Jwts.builder()
            .subject(email)
            .claim("roles", roles)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessExpiration))
            .signWith(getSigningKey())
            .compact();
    }

    // Refresh Token 생성
    public String generateRefreshToken(String email) {
        return Jwts.builder()
            .subject(email)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
            .signWith(getSigningKey())
            .compact();
    }

    // Claims 추출
    public Claims extractClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

---

## 6. JWT 인증 필터 구현

모든 요청에서 `Authorization: Bearer <token>` 헤더를 파싱해 인증 정보를 SecurityContext에 등록한다.

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String email = jwtUtil.extractEmail(token);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
                );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
```

---

## 7. 로그인 · 회원가입 API

**UserDetailsService 구현**

```java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("사용자 없음: " + email));

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPassword())
            .roles(user.getRole().name())
            .build();
    }
}
```

**AuthController**

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody @Valid SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok("회원가입 완료");
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest request) {
        TokenResponse tokens = authService.login(request);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(
        @CookieValue(name = "refreshToken") String refreshToken) {
        TokenResponse tokens = authService.refresh(refreshToken);
        return ResponseEntity.ok(tokens);
    }
}
```

**AuthService**

```java
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public void signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일");
        }
        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(Role.USER)
            .build();
        userRepository.save(user);
    }

    public TokenResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String accessToken = jwtUtil.generateAccessToken(
            user.getEmail(), List.of("ROLE_" + user.getRole().name()));
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        // Refresh Token DB 저장 (선택 — 탈취 대응용)
        user.updateRefreshToken(refreshToken);
        userRepository.save(user);

        return new TokenResponse(accessToken, refreshToken);
    }
}
```

---

## 8. Refresh Token 전략

Access Token이 만료되면 Refresh Token으로 재발급하는 흐름이다.

```
[Client]                         [Server]
   │── POST /api/auth/login ────────▶│
   │◀─ access(30분) + refresh(7일) ──│
   │                                 │
   │── API 요청 (Access Token) ──────▶│
   │◀─ 200 OK ───────────────────────│
   │                                 │
   │ (Access Token 만료)              │
   │── API 요청 ──────────────────────▶│
   │◀─ 401 Unauthorized ─────────────│
   │                                 │
   │── POST /api/auth/refresh ───────▶│ (Refresh Token 전송)
   │◀─ 새 Access Token ──────────────│
   │                                 │
   │── 원래 API 재요청 ────────────────▶│
   │◀─ 200 OK ───────────────────────│
```

**Refresh Token 재발급 서비스**

```java
public TokenResponse refresh(String refreshToken) {
    if (!jwtUtil.isTokenValid(refreshToken)) {
        throw new IllegalArgumentException("유효하지 않은 Refresh Token");
    }

    String email = jwtUtil.extractEmail(refreshToken);
    User user = userRepository.findByEmail(email).orElseThrow();

    // DB에 저장된 토큰과 비교 (탈취 감지)
    if (!refreshToken.equals(user.getRefreshToken())) {
        throw new IllegalArgumentException("토큰 불일치 — 탈취 의심");
    }

    String newAccessToken = jwtUtil.generateAccessToken(
        email, List.of("ROLE_" + user.getRole().name()));
    String newRefreshToken = jwtUtil.generateRefreshToken(email);

    user.updateRefreshToken(newRefreshToken);
    userRepository.save(user);

    return new TokenResponse(newAccessToken, newRefreshToken);
}
```

---

## 9. Role 기반 권한 제어

**어노테이션으로 메서드 레벨 보안 적용**

```java
@Configuration
@EnableMethodSecurity   // @PreAuthorize 활성화
public class MethodSecurityConfig {}
```

```java
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto> getUsers() {
        // ...
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.username")
    public void deleteUser(@PathVariable Long id) {
        // ...
    }
}
```

**Role Enum**

```java
public enum Role {
    USER, ADMIN, MANAGER
}
```

---

## 10. React 연동 — axios 인터셉터

Access Token은 메모리(React state 또는 전역 변수)에 보관하고, 만료 시 자동으로 재발급한다.

```typescript
// api/axiosInstance.ts
import axios from 'axios';

let accessToken: string | null = null;

export const setAccessToken = (token: string) => { accessToken = token; };
export const clearAccessToken = () => { accessToken = null; };

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,  // HttpOnly Cookie 전송
});

// 요청 인터셉터 — Access Token 자동 첨부
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// 응답 인터셉터 — 401 시 자동 재발급
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach(({ resolve, reject }) =>
        error ? reject(error) : resolve(token)
    );
    failedQueue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        if (error.response?.status !== 401 || original._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                original.headers.Authorization = `Bearer ${token}`;
                return api(original);
            });
        }

        original._retry = true;
        isRefreshing = true;

        try {
            const { data } = await api.post('/api/auth/refresh');
            setAccessToken(data.accessToken);
            processQueue(null, data.accessToken);
            original.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(original);
        } catch (refreshError) {
            processQueue(refreshError, null);
            clearAccessToken();
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
```

---

## 11. 실전 팁 및 주의사항

**보안 체크리스트**

- [ ] JWT Secret은 최소 256bit, 환경변수로 관리 (절대 하드코딩 금지)
- [ ] Access Token은 JS 메모리에, Refresh Token은 HttpOnly + Secure + SameSite=Strict Cookie에 저장
- [ ] HTTPS 필수 (HTTP에서 Cookie 탈취 가능)
- [ ] Refresh Token은 DB에 저장해 탈취 시 즉시 무효화
- [ ] 로그아웃 시 서버 DB의 Refresh Token도 삭제
- [ ] 토큰 만료 시간을 너무 길게 설정하지 말 것

**자주 하는 실수**

```java
// ❌ 잘못된 예 — 매번 DB 조회
public boolean isTokenValid(String token) {
    String email = extractEmail(token);
    User user = userRepository.findByEmail(email).orElseThrow(); // 비효율
    return !isExpired(token);
}

// ✅ 올바른 예 — 서명 검증만으로 충분
public boolean isTokenValid(String token) {
    try {
        Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
        return true;
    } catch (JwtException e) {
        return false;
    }
}
```

**CORS 설정 (SPA 연동 필수)**

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:5173", "https://yourdomain.com"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);  // withCredentials 필수

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

---

Spring Security + JWT 조합은 설정이 많지만, 구조를 한 번 잡아두면 어떤 프로젝트에도 재사용할 수 있다. Access Token / Refresh Token 이중 전략과 React axios 인터셉터까지 연결하면 실무에서 바로 쓸 수 있는 완전한 인증 시스템이 완성된다. 🔐
