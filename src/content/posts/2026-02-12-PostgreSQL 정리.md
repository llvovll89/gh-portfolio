---
title: PostgreSQL 정리
date: 2026-02-12
summary: PostgreSQL 기본부터 고급 기능, 성능 최적화까지 실무에서 바로 쓰는 PostgreSQL 완벽 가이드
tags: [postgresql, database, sql, rdbms, backend]
---

# PostgreSQL 정리 (실무에서 쓰는 PostgreSQL 가이드)

**PostgreSQL**은 강력한 오픈소스 관계형 데이터베이스 관리 시스템(RDBMS)으로, 표준 SQL을 준수하면서도 다양한 고급 기능을 제공합니다.

> 목표: PostgreSQL의 **핵심 개념을 이해**하고, **실전 SQL 작성 능력**을 키워 **자신감 있게 데이터베이스 다루기**

---

## 목차

1) PostgreSQL이란? (개념과 특징)
2) 설치 및 초기 설정
3) 데이터베이스 및 테이블 관리
4) CRUD 기본 쿼리
5) 조인(JOIN)과 서브쿼리
6) 집계 함수와 그룹화
7) 인덱스와 성능 최적화
8) 트랜잭션과 동시성 제어
9) 고급 기능 (CTE, Window Functions)
10) 백업과 복구
11) 유용한 명령어 치트시트

---

## 1) PostgreSQL이란? (개념과 특징)

### 1.1 PostgreSQL의 핵심 특징

**PostgreSQL의 장점**:
- **ACID 준수**: 트랜잭션의 원자성, 일관성, 격리성, 지속성 보장
- **확장성**: 커스텀 함수, 데이터 타입, 연산자 정의 가능
- **표준 SQL 지원**: ANSI SQL 표준을 충실히 준수
- **고급 데이터 타입**: JSON, JSONB, Array, hstore 등 지원
- **강력한 동시성**: MVCC(Multi-Version Concurrency Control)
- **오픈소스**: MIT 유사 라이선스로 무료 사용 가능

### 1.2 MySQL vs PostgreSQL

| 기능 | PostgreSQL | MySQL |
|---|---|---|
| 라이선스 | PostgreSQL License (MIT 유사) | GPL (Community), Commercial |
| ACID 준수 | 완벽 | InnoDB만 지원 |
| JSON 지원 | JSONB (바이너리, 빠름) | JSON (텍스트) |
| Window Functions | ✅ | ✅ (8.0+) |
| 복잡한 쿼리 | 강력 | 상대적으로 약함 |
| 읽기 성능 | 우수 | 매우 우수 |
| 쓰기 성능 | 우수 | 우수 |

**언제 PostgreSQL을 선택하나?**
- 복잡한 쿼리와 집계가 많은 경우
- JSON 데이터를 효율적으로 다뤄야 할 때
- 데이터 무결성이 중요한 금융/의료 시스템
- 공간 정보(GIS) 처리가 필요한 경우 (PostGIS)

---

## 2) 설치 및 초기 설정

### 2.1 설치 (Ubuntu/Debian)

```bash
# PostgreSQL 저장소 추가
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# 서비스 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 버전 확인
psql --version
# psql (PostgreSQL) 15.2
```

### 2.2 설치 (macOS)

```bash
# Homebrew로 설치
brew install postgresql@15

# 서비스 시작
brew services start postgresql@15

# 버전 확인
psql --version
```

### 2.3 설치 (Windows)

1. [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/)에서 인스톨러 다운로드
2. 설치 중 포트(기본 5432), 슈퍼유저 비밀번호 설정
3. pgAdmin 4 함께 설치 (GUI 도구)

### 2.4 초기 설정

```bash
# PostgreSQL 유저로 전환
sudo -i -u postgres

# psql 접속
psql

# 비밀번호 설정
\password postgres

# 새 유저 생성
CREATE USER myuser WITH PASSWORD 'mypassword';

# 새 데이터베이스 생성 및 권한 부여
CREATE DATABASE mydb OWNER myuser;

# 종료
\q
exit
```

### 2.5 외부 접속 허용 (선택사항)

```bash
# postgresql.conf 수정
sudo nano /etc/postgresql/15/main/postgresql.conf

# 다음 라인 찾아서 수정
listen_addresses = '*'          # 모든 IP 허용

# pg_hba.conf 수정
sudo nano /etc/postgresql/15/main/pg_hba.conf

# 추가
host    all             all             0.0.0.0/0            md5

# 재시작
sudo systemctl restart postgresql
```

---

## 3) 데이터베이스 및 테이블 관리

### 3.1 데이터베이스 명령어

```sql
-- 데이터베이스 목록
\l
-- 또는
SELECT datname FROM pg_database;

-- 데이터베이스 생성
CREATE DATABASE shop;
CREATE DATABASE blog ENCODING 'UTF8' LC_COLLATE 'ko_KR.UTF-8';

-- 데이터베이스 선택
\c shop

-- 데이터베이스 삭제
DROP DATABASE blog;

-- 데이터베이스 이름 변경
ALTER DATABASE old_name RENAME TO new_name;
```

### 3.2 테이블 생성

```sql
-- 기본 테이블 생성
CREATE TABLE users (
    id SERIAL PRIMARY KEY,              -- 자동 증가 기본키
    email VARCHAR(255) UNIQUE NOT NULL, -- 고유, NULL 불가
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 외래키 관계 테이블
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 테이블 목록 확인
\dt

-- 테이블 구조 확인
\d users
-- 또는
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';
```

### 3.3 테이블 수정

```sql
-- 컬럼 추가
ALTER TABLE users ADD COLUMN age INTEGER;
ALTER TABLE users ADD COLUMN phone VARCHAR(20) UNIQUE;

-- 컬럼 삭제
ALTER TABLE users DROP COLUMN age;

-- 컬럼 이름 변경
ALTER TABLE users RENAME COLUMN username TO user_name;

-- 컬럼 타입 변경
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(300);

-- NOT NULL 제약조건 추가
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;

-- NOT NULL 제약조건 제거
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- 테이블 이름 변경
ALTER TABLE users RENAME TO members;

-- 테이블 삭제
DROP TABLE posts;
DROP TABLE IF EXISTS posts;  -- 존재하면 삭제
```

### 3.4 주요 데이터 타입

```sql
-- 숫자
INTEGER, BIGINT, SMALLINT       -- 정수
DECIMAL(10,2), NUMERIC(10,2)    -- 고정 소수점
REAL, DOUBLE PRECISION          -- 부동 소수점
SERIAL, BIGSERIAL               -- 자동 증가

-- 문자열
CHAR(10)                        -- 고정 길이
VARCHAR(255)                    -- 가변 길이
TEXT                            -- 무제한 길이

-- 날짜/시간
DATE                            -- 날짜만
TIME                            -- 시간만
TIMESTAMP                       -- 날짜 + 시간
TIMESTAMPTZ                     -- 타임존 포함
INTERVAL                        -- 시간 간격

-- 불린
BOOLEAN                         -- TRUE/FALSE

-- JSON
JSON                            -- JSON 텍스트
JSONB                           -- JSON 바이너리 (빠름, 권장)

-- 배열
INTEGER[]                       -- 정수 배열
TEXT[]                          -- 문자열 배열
```

---

## 4) CRUD 기본 쿼리

### 4.1 INSERT (생성)

```sql
-- 단일 행 삽입
INSERT INTO users (email, username, password)
VALUES ('user@example.com', 'john', 'hashed_pw');

-- 여러 행 한번에 삽입
INSERT INTO users (email, username, password) VALUES
    ('alice@example.com', 'alice', 'pw1'),
    ('bob@example.com', 'bob', 'pw2'),
    ('carol@example.com', 'carol', 'pw3');

-- 삽입 후 결과 반환
INSERT INTO users (email, username, password)
VALUES ('user@example.com', 'sarah', 'pw123')
RETURNING id, email, created_at;

-- 기본값 사용
INSERT INTO users (email, username, password)
VALUES ('user@example.com', 'mike', 'pw')
RETURNING *;
```

### 4.2 SELECT (조회)

```sql
-- 전체 조회
SELECT * FROM users;

-- 특정 컬럼만
SELECT id, email, username FROM users;

-- 조건부 조회 (WHERE)
SELECT * FROM users WHERE id = 1;
SELECT * FROM users WHERE email = 'user@example.com';
SELECT * FROM users WHERE created_at > '2026-01-01';

-- 논리 연산자
SELECT * FROM users WHERE age >= 18 AND age < 65;
SELECT * FROM users WHERE username = 'admin' OR username = 'root';
SELECT * FROM users WHERE username IN ('alice', 'bob', 'carol');
SELECT * FROM users WHERE email LIKE '%@gmail.com';
SELECT * FROM users WHERE username LIKE 'a%';  -- a로 시작
SELECT * FROM users WHERE username ILIKE '%ADMIN%';  -- 대소문자 무시

-- NULL 체크
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;

-- 정렬
SELECT * FROM users ORDER BY created_at DESC;
SELECT * FROM users ORDER BY age ASC, username DESC;

-- 제한
SELECT * FROM users LIMIT 10;
SELECT * FROM users LIMIT 10 OFFSET 20;  -- 페이지네이션

-- 중복 제거
SELECT DISTINCT username FROM users;
```

### 4.3 UPDATE (수정)

```sql
-- 단일 필드 수정
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;

-- 여러 필드 동시 수정
UPDATE users
SET username = 'john_doe',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- 조건부 수정
UPDATE posts SET published = TRUE WHERE user_id = 5;

-- 계산식 사용
UPDATE products SET price = price * 1.1;  -- 10% 인상

-- 수정 후 결과 반환
UPDATE users
SET username = 'updated_name'
WHERE id = 1
RETURNING *;
```

### 4.4 DELETE (삭제)

```sql
-- 조건부 삭제
DELETE FROM users WHERE id = 10;
DELETE FROM posts WHERE created_at < '2025-01-01';

-- 전체 삭제 (주의!)
DELETE FROM users;

-- TRUNCATE (더 빠름, 롤백 불가)
TRUNCATE TABLE users;
TRUNCATE TABLE users RESTART IDENTITY;  -- AUTO_INCREMENT 초기화

-- 삭제 후 결과 반환
DELETE FROM users WHERE id = 5 RETURNING *;
```

---

## 5) 조인(JOIN)과 서브쿼리

### 5.1 INNER JOIN

```sql
-- 기본 INNER JOIN
SELECT users.username, posts.title, posts.created_at
FROM users
INNER JOIN posts ON users.id = posts.user_id
ORDER BY posts.created_at DESC;

-- 테이블 별칭 사용
SELECT u.username, p.title
FROM users u
INNER JOIN posts p ON u.id = p.user_id;

-- 여러 테이블 조인
SELECT u.username, p.title, c.content AS comment
FROM users u
INNER JOIN posts p ON u.id = p.user_id
INNER JOIN comments c ON p.id = c.post_id;
```

### 5.2 LEFT JOIN

```sql
-- 모든 유저와 그들의 포스트 (포스트 없어도 유저 표시)
SELECT u.username, p.title
FROM users u
LEFT JOIN posts p ON u.id = p.user_id;

-- 포스트가 없는 유저만 찾기
SELECT u.username
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE p.id IS NULL;
```

### 5.3 서브쿼리

```sql
-- WHERE 절 서브쿼리
SELECT * FROM users
WHERE id IN (SELECT user_id FROM posts WHERE published = TRUE);

-- FROM 절 서브쿼리
SELECT avg_age FROM (
    SELECT AVG(age) AS avg_age FROM users
) AS subquery;

-- SELECT 절 서브쿼리
SELECT
    username,
    (SELECT COUNT(*) FROM posts WHERE posts.user_id = users.id) AS post_count
FROM users;
```

### 5.4 EXISTS

```sql
-- 포스트가 있는 유저만
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM posts p WHERE p.user_id = u.id
);

-- 포스트가 없는 유저만
SELECT * FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM posts p WHERE p.user_id = u.id
);
```

---

## 6) 집계 함수와 그룹화

### 6.1 기본 집계 함수

```sql
-- 개수
SELECT COUNT(*) FROM users;
SELECT COUNT(phone) FROM users;  -- NULL 제외
SELECT COUNT(DISTINCT email) FROM users;

-- 합계/평균/최대/최소
SELECT SUM(price) FROM products;
SELECT AVG(age) FROM users;
SELECT MAX(created_at) FROM posts;
SELECT MIN(price) FROM products;
```

### 6.2 GROUP BY

```sql
-- 유저별 포스트 개수
SELECT user_id, COUNT(*) AS post_count
FROM posts
GROUP BY user_id
ORDER BY post_count DESC;

-- 날짜별 가입자 수
SELECT DATE(created_at) AS signup_date, COUNT(*) AS count
FROM users
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- 여러 컬럼으로 그룹화
SELECT category, published, COUNT(*) AS count
FROM posts
GROUP BY category, published;
```

### 6.3 HAVING

```sql
-- 포스트가 5개 이상인 유저만
SELECT user_id, COUNT(*) AS post_count
FROM posts
GROUP BY user_id
HAVING COUNT(*) >= 5
ORDER BY post_count DESC;

-- 평균 가격이 10000원 이상인 카테고리
SELECT category, AVG(price) AS avg_price
FROM products
GROUP BY category
HAVING AVG(price) >= 10000;
```

---

## 7) 인덱스와 성능 최적화

### 7.1 인덱스 생성

```sql
-- 단일 컬럼 인덱스
CREATE INDEX idx_users_email ON users(email);

-- 복합 인덱스
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- 고유 인덱스
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- 부분 인덱스 (조건부)
CREATE INDEX idx_published_posts ON posts(created_at DESC)
WHERE published = TRUE;

-- JSONB 인덱스
CREATE INDEX idx_data_gin ON users USING GIN(metadata);

-- 인덱스 목록 확인
\di

-- 인덱스 삭제
DROP INDEX idx_users_email;
```

### 7.2 쿼리 성능 분석

```sql
-- 실행 계획 확인
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

-- 상세 분석 (실제 실행)
EXPLAIN ANALYZE SELECT * FROM posts
WHERE user_id = 5
ORDER BY created_at DESC
LIMIT 10;

-- 비용, 실행 시간 확인
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users;
```

### 7.3 성능 최적화 팁

```sql
-- BAD: SELECT *는 피하기
SELECT * FROM users;

-- GOOD: 필요한 컬럼만
SELECT id, email, username FROM users;

-- BAD: OR 대신 IN 사용
SELECT * FROM users WHERE id = 1 OR id = 2 OR id = 3;

-- GOOD
SELECT * FROM users WHERE id IN (1, 2, 3);

-- BAD: LIKE로 시작하는 와일드카드
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- GOOD: 끝나는 패턴은 인덱스 활용 가능
SELECT * FROM users WHERE email LIKE 'admin%';
```

---

## 8) 트랜잭션과 동시성 제어

### 8.1 트랜잭션 기본

```sql
-- 트랜잭션 시작
BEGIN;

-- 작업 수행
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- 커밋 (영구 반영)
COMMIT;

-- 또는 롤백 (취소)
ROLLBACK;
```

### 8.2 SAVEPOINT

```sql
BEGIN;

INSERT INTO users (email, username, password)
VALUES ('user1@example.com', 'user1', 'pw');

SAVEPOINT sp1;

INSERT INTO users (email, username, password)
VALUES ('user2@example.com', 'user2', 'pw');

-- sp1 이후 작업만 롤백
ROLLBACK TO SAVEPOINT sp1;

COMMIT;
```

### 8.3 격리 수준

```sql
-- 현재 격리 수준 확인
SHOW transaction_isolation;

-- 격리 수준 변경
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- 작업 수행
COMMIT;
```

**격리 수준 종류**:
- `READ UNCOMMITTED`: 커밋 안 된 데이터 읽기 가능 (PostgreSQL 미지원)
- `READ COMMITTED`: 커밋된 데이터만 읽기 (기본값)
- `REPEATABLE READ`: 트랜잭션 내에서 동일한 읽기 결과 보장
- `SERIALIZABLE`: 완전한 격리 (가장 안전, 성능 저하)

---

## 9) 고급 기능 (CTE, Window Functions)

### 9.1 CTE (Common Table Expressions)

```sql
-- 기본 CTE
WITH active_users AS (
    SELECT * FROM users WHERE last_login > CURRENT_DATE - INTERVAL '30 days'
)
SELECT * FROM active_users WHERE age >= 18;

-- 여러 CTE
WITH
    user_posts AS (
        SELECT user_id, COUNT(*) AS post_count
        FROM posts
        GROUP BY user_id
    ),
    active_users AS (
        SELECT id FROM users WHERE last_login > CURRENT_DATE - INTERVAL '7 days'
    )
SELECT u.username, up.post_count
FROM users u
INNER JOIN user_posts up ON u.id = up.user_id
WHERE u.id IN (SELECT id FROM active_users);
```

### 9.2 재귀 CTE

```sql
-- 계층 구조 (조직도, 댓글 트리)
WITH RECURSIVE org_tree AS (
    -- 초기 쿼리 (최상위)
    SELECT id, name, manager_id, 1 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- 재귀 쿼리
    SELECT e.id, e.name, e.manager_id, ot.level + 1
    FROM employees e
    INNER JOIN org_tree ot ON e.manager_id = ot.id
)
SELECT * FROM org_tree ORDER BY level, name;
```

### 9.3 Window Functions

```sql
-- ROW_NUMBER: 순위 매기기
SELECT
    username,
    email,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) AS row_num
FROM users;

-- RANK: 동점 허용 순위
SELECT
    username,
    score,
    RANK() OVER (ORDER BY score DESC) AS rank
FROM game_scores;

-- PARTITION BY: 그룹별 순위
SELECT
    category,
    product_name,
    price,
    RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rank_in_category
FROM products;

-- LAG/LEAD: 이전/다음 행 참조
SELECT
    date,
    revenue,
    LAG(revenue) OVER (ORDER BY date) AS prev_revenue,
    LEAD(revenue) OVER (ORDER BY date) AS next_revenue
FROM daily_sales;

-- 누적 합계
SELECT
    date,
    amount,
    SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_sum
FROM transactions;
```

---

## 10) 백업과 복구

### 10.1 pg_dump (백업)

```bash
# 단일 데이터베이스 백업
pg_dump -U postgres mydb > backup.sql

# 압축 백업
pg_dump -U postgres -Fc mydb > backup.dump

# 특정 테이블만
pg_dump -U postgres -t users -t posts mydb > tables_backup.sql

# 데이터만 (스키마 제외)
pg_dump -U postgres --data-only mydb > data_only.sql

# 스키마만 (데이터 제외)
pg_dump -U postgres --schema-only mydb > schema_only.sql
```

### 10.2 pg_dumpall (전체 백업)

```bash
# 모든 데이터베이스 백업
pg_dumpall -U postgres > full_backup.sql

# 유저/권한만
pg_dumpall -U postgres --roles-only > roles.sql
```

### 10.3 복구

```bash
# SQL 파일 복구
psql -U postgres mydb < backup.sql

# 압축 백업 복구
pg_restore -U postgres -d mydb backup.dump

# 새 데이터베이스 생성 후 복구
createdb -U postgres mydb_restored
pg_restore -U postgres -d mydb_restored backup.dump
```

### 10.4 자동 백업 (Cron)

```bash
# 백업 스크립트 작성
nano /home/postgres/backup.sh

# 내용:
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres mydb > /backups/mydb_$DATE.sql
find /backups -name "mydb_*.sql" -mtime +7 -delete

# 실행 권한
chmod +x /home/postgres/backup.sh

# Cron 등록 (매일 새벽 2시)
crontab -e
0 2 * * * /home/postgres/backup.sh
```

---

## 11) 유용한 명령어 치트시트

### 11.1 psql 명령어

```bash
# 접속
psql -U username -d database -h host -p 5432

# 데이터베이스 목록
\l

# 테이블 목록
\dt

# 테이블 구조
\d table_name

# 인덱스 목록
\di

# 뷰 목록
\dv

# 유저 목록
\du

# 실행 시간 표시
\timing

# SQL 파일 실행
\i /path/to/file.sql

# 결과를 파일로 저장
\o output.txt
SELECT * FROM users;
\o

# 종료
\q
```

### 11.2 자주 쓰는 쿼리 패턴

```sql
-- 페이지네이션
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;  -- 3페이지 (페이지당 20개)

-- 랜덤 샘플링
SELECT * FROM users ORDER BY RANDOM() LIMIT 10;

-- UPSERT (중복 시 업데이트)
INSERT INTO products (id, name, price)
VALUES (1, 'Product A', 10000)
ON CONFLICT (id)
DO UPDATE SET price = EXCLUDED.price;

-- 날짜 범위 검색
SELECT * FROM orders
WHERE created_at BETWEEN '2026-01-01' AND '2026-01-31';

-- 빈 문자열 제거
UPDATE users SET phone = NULL WHERE phone = '';

-- 대량 삭제 (배치)
DELETE FROM logs WHERE id IN (
    SELECT id FROM logs WHERE created_at < CURRENT_DATE - INTERVAL '1 year' LIMIT 10000
);
```

### 11.3 JSON 쿼리

```sql
-- JSONB 데이터 삽입
INSERT INTO users (email, metadata)
VALUES ('user@example.com', '{"age": 25, "city": "Seoul"}');

-- JSON 필드 조회
SELECT metadata->>'age' AS age FROM users;
SELECT metadata->'address'->>'city' AS city FROM users;

-- JSON 조건 검색
SELECT * FROM users WHERE metadata->>'city' = 'Seoul';
SELECT * FROM users WHERE (metadata->>'age')::int > 20;

-- JSON 배열 포함 여부
SELECT * FROM users WHERE metadata->'tags' ? 'developer';
```

---

## 마무리

PostgreSQL은 **강력한 기능과 표준 준수로 엔터프라이즈급 애플리케이션에 적합**합니다.

**핵심 요약**:
1. **CRUD**: INSERT, SELECT, UPDATE, DELETE + RETURNING
2. **조인**: INNER/LEFT JOIN, 서브쿼리, EXISTS
3. **집계**: GROUP BY + HAVING으로 데이터 분석
4. **성능**: 인덱스(B-Tree, GIN) + EXPLAIN ANALYZE
5. **트랜잭션**: BEGIN + COMMIT/ROLLBACK으로 데이터 무결성

**실무 팁**:
- 인덱스는 자주 조회되는 컬럼에만 생성 (쓰기 성능 저하 주의)
- EXPLAIN ANALYZE로 슬로우 쿼리 분석 습관화
- JSONB는 유연하지만 정규화된 테이블보다 느림
- 트랜잭션으로 데이터 일관성 보장
- 정기적인 VACUUM으로 성능 유지

**다음 단계**:
- 복제(Replication)와 고가용성 구성
- 파티셔닝으로 대용량 테이블 관리
- PostGIS로 공간정보 처리
- pgAdmin, DBeaver 같은 GUI 도구 활용
- 연결 풀링 (PgBouncer) 설정

**추가 학습 자료**:
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/) - 최고의 레퍼런스
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/) - 초보자 친화적
- [Use The Index, Luke!](https://use-the-index-luke.com/) - 인덱스 최적화
- [Postgres Weekly](https://postgresweekly.com/) - 주간 뉴스레터
