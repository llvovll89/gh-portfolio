---
title: Spring Boot + JPA 정리
date: 2026-02-08
summary: Spring Boot 기초부터 JPA 실전 활용까지 - 엔터프라이즈 애플리케이션 개발의 정석
tags: [spring-boot, jpa, hibernate, spring-data-jpa, entity, repository, java]
---

# Spring Boot + JPA 정리 (실전 중심)

**Spring Boot**는 스프링 기반 애플리케이션을 빠르고 쉽게 만들 수 있는 **프레임워크**입니다.
**JPA (Java Persistence API)**는 자바에서 ORM(Object-Relational Mapping)을 위한 **표준 인터페이스**입니다.

> 목표: Spring Boot의 **핵심 개념 이해**하고, JPA로 **데이터베이스 효율적으로 다루기**

---

## 목차

1) Spring Boot란?
2) Spring Boot 핵심 특징
3) 프로젝트 구조 및 설정
4) JPA란?
5) Entity 설계
6) Repository 패턴
7) 연관관계 매핑
8) JPQL & QueryDSL
9) N+1 문제 해결
10) 실전 예제
11) 성능 최적화 팁

---

## 1) Spring Boot란?

### 1.1 정의

**Spring Boot**는 스프링 프레임워크를 기반으로 **최소한의 설정**으로 독립 실행 가능한 애플리케이션을 만들 수 있는 도구입니다.

- **Convention over Configuration** (설정보다 관례)
- **내장 서버** (Tomcat, Jetty 등)
- **자동 설정** (Auto Configuration)

### 1.2 왜 Spring Boot를 사용하나?

**기존 Spring의 문제**:

```xml
<!-- 복잡한 XML 설정 -->
<bean id="dataSource" class="...">
  <property name="driverClassName" value="..." />
  <property name="url" value="..." />
  ...
</bean>
```

**Spring Boot의 해결**:

```yaml
# application.yml (간단한 설정)
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: 1234
```

### 1.3 주요 특징

| 특징 | 설명 |
|---|---|
| **Auto Configuration** | 필요한 설정 자동 구성 |
| **Starter Dependencies** | 관련 라이브러리 묶음 제공 |
| **Embedded Server** | Tomcat 내장 (별도 설치 불요) |
| **Spring Boot CLI** | 커맨드라인 도구 |
| **Actuator** | 애플리케이션 모니터링 |

---

## 2) Spring Boot 핵심 특징

### 2.1 Starter Dependencies

관련 라이브러리를 묶어서 제공:

```xml
<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

### 2.2 Auto Configuration

조건에 따라 자동으로 Bean 등록:

```java
@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

**@SpringBootApplication** = @Configuration + @EnableAutoConfiguration + @ComponentScan

### 2.3 application.properties / application.yml

```yaml
# application.yml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: 1234
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

---

## 3) 프로젝트 구조

### 3.1 권장 폴더 구조

```
src/
  main/
    java/
      com.example.demo/
        DemoApplication.java
        controller/
          UserController.java
        service/
          UserService.java
        repository/
          UserRepository.java
        entity/
          User.java
        dto/
          UserDto.java
    resources/
      application.yml
      static/
      templates/
  test/
```

### 3.2 계층별 역할

| 계층 | 역할 |
|---|---|
| **Controller** | HTTP 요청/응답 처리 |
| **Service** | 비즈니스 로직 |
| **Repository** | 데이터베이스 접근 |
| **Entity** | 데이터베이스 테이블 매핑 |
| **DTO** | 데이터 전송 객체 |

---

## 4) JPA란?

### 4.1 정의

**JPA (Java Persistence API)**는 자바 ORM 기술의 **표준 명세**입니다.

- **ORM**: 객체와 관계형 데이터베이스를 매핑
- **Hibernate**: JPA의 대표적인 구현체

### 4.2 왜 JPA를 사용하나?

**기존 JDBC**:

```java
String sql = "SELECT * FROM users WHERE id = ?";
PreparedStatement pstmt = conn.prepareStatement(sql);
pstmt.setLong(1, userId);
ResultSet rs = pstmt.executeQuery();

while (rs.next()) {
    User user = new User();
    user.setId(rs.getLong("id"));
    user.setName(rs.getString("name"));
    // ...
}
```

**JPA**:

```java
User user = entityManager.find(User.class, userId);
```

### 4.3 JPA vs MyBatis

| 항목 | JPA | MyBatis |
|---|---|---|
| **SQL 작성** | 자동 생성 | 수동 작성 |
| **객체 중심** | ✅ 높음 | ⚠️ 낮음 |
| **복잡한 쿼리** | ⚠️ 어려움 | ✅ 쉬움 |
| **유지보수** | ✅ 좋음 | ⚠️ SQL 관리 필요 |

---

## 5) Entity 설계

### 5.1 기본 Entity

```java
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(unique = true)
    private String email;

    private Integer age;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

### 5.2 주요 어노테이션

| 어노테이션 | 설명 |
|---|---|
| **@Entity** | JPA 엔티티 클래스 |
| **@Table** | 테이블 이름 지정 |
| **@Id** | 기본 키 |
| **@GeneratedValue** | 기본 키 생성 전략 |
| **@Column** | 컬럼 속성 지정 |
| **@Enumerated** | Enum 타입 매핑 |

### 5.3 기본 키 생성 전략

```java
// IDENTITY: DB에 위임 (MySQL AUTO_INCREMENT)
@GeneratedValue(strategy = GenerationType.IDENTITY)

// SEQUENCE: DB 시퀀스 사용 (Oracle, PostgreSQL)
@GeneratedValue(strategy = GenerationType.SEQUENCE)

// TABLE: 키 생성 테이블 사용
@GeneratedValue(strategy = GenerationType.TABLE)

// AUTO: DB 방언에 따라 자동 선택
@GeneratedValue(strategy = GenerationType.AUTO)
```

---

## 6) Repository 패턴

### 6.1 JpaRepository

**Spring Data JPA**는 Repository 인터페이스만 정의하면 구현체를 자동 생성합니다.

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    // 메서드 이름으로 쿼리 자동 생성
    List<User> findByName(String name);

    Optional<User> findByEmail(String email);

    List<User> findByAgeGreaterThan(Integer age);

    // @Query: JPQL 직접 작성
    @Query("SELECT u FROM User u WHERE u.age BETWEEN :min AND :max")
    List<User> findByAgeBetween(@Param("min") Integer min,
                                 @Param("max") Integer max);

    // Native SQL
    @Query(value = "SELECT * FROM users WHERE name LIKE %:keyword%",
           nativeQuery = true)
    List<User> searchByName(@Param("keyword") String keyword);
}
```

### 6.2 쿼리 메서드 규칙

| 키워드 | 예시 | SQL |
|---|---|---|
| **findBy** | findByName(String name) | WHERE name = ? |
| **And** | findByNameAndAge(...) | WHERE name = ? AND age = ? |
| **Or** | findByNameOrEmail(...) | WHERE name = ? OR email = ? |
| **GreaterThan** | findByAgeGreaterThan(...) | WHERE age > ? |
| **LessThan** | findByAgeLessThan(...) | WHERE age < ? |
| **Like** | findByNameLike(...) | WHERE name LIKE ? |
| **OrderBy** | findByNameOrderByAgeDesc(...) | ORDER BY age DESC |

### 6.3 Paging & Sorting

```java
public interface UserRepository extends JpaRepository<User, Long> {

    // 페이징
    Page<User> findByName(String name, Pageable pageable);

    // 정렬
    List<User> findByName(String name, Sort sort);
}

// 사용 예시
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Page<User> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                            Sort.by("createdAt").descending());
        return userRepository.findAll(pageable);
    }
}
```

---

## 7) 연관관계 매핑

### 7.1 일대다 (1:N)

```java
// User (1) : Post (N)

@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Post> posts = new ArrayList<>();
}

@Entity
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
```

### 7.2 다대다 (N:M)

```java
// Student (N) : Course (M)

@Entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany
    @JoinTable(
        name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private List<Course> courses = new ArrayList<>();
}

@Entity
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany(mappedBy = "courses")
    private List<Student> students = new ArrayList<>();
}
```

### 7.3 일대일 (1:1)

```java
// User (1) : Profile (1)

@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Profile profile;
}

@Entity
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
```

### 7.4 Fetch 전략

| 전략 | 설명 | 사용 시점 |
|---|---|---|
| **EAGER** | 즉시 로딩 | 항상 함께 조회 |
| **LAZY** | 지연 로딩 | 실제 사용 시점에 조회 |

**권장**: 기본적으로 **LAZY** 사용 (성능 최적화)

---

## 8) JPQL & QueryDSL

### 8.1 JPQL (Java Persistence Query Language)

객체 지향 쿼리 언어:

```java
@Repository
public class UserRepositoryCustom {

    @PersistenceContext
    private EntityManager em;

    public List<User> findUsersByAge(int minAge) {
        return em.createQuery(
            "SELECT u FROM User u WHERE u.age >= :minAge", User.class)
            .setParameter("minAge", minAge)
            .getResultList();
    }
}
```

### 8.2 QueryDSL

타입 세이프한 쿼리 빌더:

```java
// build.gradle
dependencies {
    implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
    annotationProcessor 'com.querydsl:querydsl-apt:5.0.0:jakarta'
}

// 사용
@Repository
public class UserRepositoryImpl {

    @Autowired
    private JPAQueryFactory queryFactory;

    public List<User> findActiveUsers(Integer minAge) {
        QUser user = QUser.user;

        return queryFactory
            .selectFrom(user)
            .where(user.age.goe(minAge)
                .and(user.role.eq(UserRole.ACTIVE)))
            .orderBy(user.createdAt.desc())
            .fetch();
    }
}
```

---

## 9) N+1 문제 해결

### 9.1 문제 상황

```java
List<User> users = userRepository.findAll(); // 1번 쿼리
for (User user : users) {
    List<Post> posts = user.getPosts(); // N번 쿼리 (각 유저마다)
}
```

→ 총 **1 + N번의 쿼리** 발생!

### 9.2 해결 방법

**1) Fetch Join**:

```java
@Query("SELECT u FROM User u JOIN FETCH u.posts")
List<User> findAllWithPosts();
```

**2) EntityGraph**:

```java
@EntityGraph(attributePaths = {"posts"})
@Query("SELECT u FROM User u")
List<User> findAllWithPosts();
```

**3) Batch Size**:

```yaml
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 100
```

---

## 10) 실전 예제

### 10.1 CRUD 서비스

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    // 생성
    @Transactional
    public User createUser(UserDto dto) {
        User user = User.builder()
            .name(dto.getName())
            .email(dto.getEmail())
            .age(dto.getAge())
            .build();

        return userRepository.save(user);
    }

    // 조회
    public User getUser(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    // 수정
    @Transactional
    public User updateUser(Long id, UserDto dto) {
        User user = getUser(id);
        user.updateInfo(dto.getName(), dto.getAge());
        return user; // 변경 감지 (Dirty Checking)
    }

    // 삭제
    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
```

### 10.2 Controller

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody UserDto dto) {
        User user = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.getUser(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id,
                                           @RequestBody UserDto dto) {
        User user = userService.updateUser(id, dto);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## 11) 성능 최적화 팁

### 11.1 변경 감지 (Dirty Checking)

```java
@Transactional
public void updateUser(Long id, String newName) {
    User user = userRepository.findById(id).orElseThrow();
    user.changeName(newName);
    // save() 호출 불필요! 트랜잭션 커밋 시점에 자동 UPDATE
}
```

### 11.2 Bulk 연산

```java
@Modifying
@Query("UPDATE User u SET u.age = u.age + 1 WHERE u.role = :role")
int bulkAgeIncrease(@Param("role") UserRole role);
```

### 11.3 DTO Projection

```java
public interface UserSummary {
    String getName();
    String getEmail();
}

List<UserSummary> findAllProjectedBy();
```

### 11.4 읽기 전용 최적화

```java
@Transactional(readOnly = true) // 읽기 전용 트랜잭션
public List<User> getAllUsers() {
    return userRepository.findAll();
}
```

---

## 정리 (체크리스트)

### Spring Boot 핵심

- [ ] Auto Configuration 이해
- [ ] Starter Dependencies 활용
- [ ] application.yml 설정 관리
- [ ] 계층별 역할 분리 (Controller / Service / Repository)

### JPA 핵심

- [ ] Entity 설계 (@Entity, @Id, @Column)
- [ ] Repository 인터페이스 활용
- [ ] 연관관계 매핑 (1:N, N:M, 1:1)
- [ ] LAZY 로딩 기본 사용

### 성능 최적화

- [ ] N+1 문제 인지 및 해결 (Fetch Join, EntityGraph)
- [ ] Bulk 연산 활용
- [ ] DTO Projection 사용
- [ ] @Transactional(readOnly = true) 활용

### 실전 팁

- [ ] 변경 감지 활용 (명시적 save() 최소화)
- [ ] 복잡한 쿼리는 QueryDSL 사용
- [ ] 비즈니스 로직은 Service에 위치
- [ ] API 응답은 DTO로 변환 (Entity 직접 노출 금지)

> **Spring Boot + JPA = 엔터프라이즈 애플리케이션의 표준**
> 실무에서는 Spring Data JPA + QueryDSL 조합을 많이 사용합니다!
