---
title: GitHub Actions CI/CD 실전 가이드
date: 2026-03-25
summary: GitHub Actions를 활용해 테스트 자동화, 빌드, 배포 파이프라인을 구축하는 방법을 실전 예제 중심으로 정리합니다. 트리거 설정부터 시크릿 관리, 캐싱, 재사용 워크플로우까지 다룹니다.
tags: [GitHub Actions, CI/CD, DevOps, 자동화, 배포]
---

코드를 push할 때마다 자동으로 테스트가 돌고, PR이 머지되면 자동으로 배포되는 환경 — 이것이 **CI/CD**의 핵심입니다. **GitHub Actions**는 GitHub 저장소에 내장된 자동화 플랫폼으로, 별도 서비스 없이 `.github/workflows/` 폴더에 YAML 파일만 추가하면 파이프라인을 구성할 수 있습니다.

> **목표:** GitHub Actions의 핵심 개념을 이해하고, 실전 프로젝트에서 테스트 자동화·빌드·배포 파이프라인을 직접 구성할 수 있다.

## 목차

1. [핵심 개념 이해](#1-핵심-개념-이해)
2. [워크플로우 기본 문법](#2-워크플로우-기본-문법)
3. [트리거 설정](#3-트리거-설정)
4. [자주 쓰는 Actions](#4-자주-쓰는-actions)
5. [Node.js 프로젝트 CI 예제](#5-nodejs-프로젝트-ci-예제)
6. [캐싱으로 속도 높이기](#6-캐싱으로-속도-높이기)
7. [시크릿과 환경 변수 관리](#7-시크릿과-환경-변수-관리)
8. [배포 파이프라인 예제](#8-배포-파이프라인-예제)
9. [재사용 가능한 워크플로우](#9-재사용-가능한-워크플로우)
10. [실전 팁 & 트러블슈팅](#10-실전-팁--트러블슈팅)

---

## 1. 핵심 개념 이해

```
Workflow (워크플로우)
└── Trigger (트리거) — 언제 실행할지
└── Job (잡) — 독립적으로 실행되는 작업 단위
    └── Runner (러너) — 실행 환경 (ubuntu, windows, macos)
    └── Step (스텝) — 순차 실행되는 개별 명령
        ├── Action — 재사용 가능한 스텝 패키지
        └── Run — 직접 입력한 셸 명령
```

| 용어 | 설명 |
|------|------|
| **Workflow** | 자동화 프로세스 전체. `.github/workflows/*.yml` 파일 1개 = 워크플로우 1개 |
| **Job** | 같은 Runner에서 실행되는 스텝 묶음. 기본적으로 병렬 실행 |
| **Step** | Job 안의 개별 작업. 순차 실행 |
| **Action** | 재사용 가능한 스텝 단위 (`uses: actions/checkout@v4`) |
| **Runner** | Job이 실행되는 가상 머신 (GitHub 제공 또는 self-hosted) |
| **Artifact** | Job 간 파일 공유 또는 결과물 저장 |

---

## 2. 워크플로우 기본 문법

```yaml
# .github/workflows/ci.yml
name: CI  # 워크플로우 이름

on:  # 트리거
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:  # Job ID
    runs-on: ubuntu-latest  # Runner 환경

    steps:
      - name: 코드 체크아웃
        uses: actions/checkout@v4  # Action 사용

      - name: Node.js 설정
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: 의존성 설치
        run: npm ci  # 직접 명령 실행

      - name: 테스트 실행
        run: npm test
```

### 여러 Job 실행 (병렬 & 순차)

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: test  # test Job 완료 후 실행 (순차)
    steps:
      - run: npm run build

  deploy:
    runs-on: ubuntu-latest
    needs: [test, build]  # 둘 다 완료 후 실행
    steps:
      - run: echo "배포 시작"
```

---

## 3. 트리거 설정

### 브랜치/태그 기반

```yaml
on:
  push:
    branches:
      - main
      - 'release/**'  # release/로 시작하는 모든 브랜치
    tags:
      - 'v*'          # v1.0.0 같은 태그
    paths:
      - 'src/**'      # src 폴더 변경 시만 실행
      - '!src/**/*.md' # .md 파일은 제외

  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
```

### 스케줄 (cron)

```yaml
on:
  schedule:
    - cron: '0 9 * * 1-5'  # 평일 오전 9시 (UTC)
```

### 수동 실행 (workflow_dispatch)

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: '배포 환경'
        required: true
        default: 'staging'
        type: choice
        options: [staging, production]
      dry_run:
        description: '드라이런 여부'
        type: boolean
        default: false
```

### 기타 이벤트

```yaml
on:
  issues:
    types: [opened]       # 이슈 생성 시
  release:
    types: [published]    # 릴리즈 배포 시
  workflow_run:
    workflows: ['CI']
    types: [completed]    # 다른 워크플로우 완료 시
```

---

## 4. 자주 쓰는 Actions

| Action | 역할 |
|--------|------|
| `actions/checkout@v4` | 저장소 코드 체크아웃 |
| `actions/setup-node@v4` | Node.js 버전 설정 |
| `actions/setup-python@v5` | Python 버전 설정 |
| `actions/cache@v4` | 의존성 캐싱 |
| `actions/upload-artifact@v4` | 파일 업로드 (Job 간 공유) |
| `actions/download-artifact@v4` | 파일 다운로드 |
| `github/codeql-action` | 코드 보안 분석 |
| `peaceiris/actions-gh-pages@v4` | GitHub Pages 배포 |

### Matrix 전략 (여러 환경 동시 테스트)

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: ['18', '20', '22']
      fail-fast: false  # 하나 실패해도 나머지 계속 실행

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci && npm test
```

---

## 5. Node.js 프로젝트 CI 예제

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: 체크아웃
        uses: actions/checkout@v4

      - name: Node.js 20 설정
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # npm 캐시 자동 처리

      - name: 의존성 설치
        run: npm ci

      - name: 타입 체크
        run: npm run type-check

      - name: 린트
        run: npm run lint

      - name: 테스트 (커버리지 포함)
        run: npm run coverage

      - name: 커버리지 업로드
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

  build:
    runs-on: ubuntu-latest
    needs: lint-and-test

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: 빌드 결과물 업로드
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
```

---

## 6. 캐싱으로 속도 높이기

의존성 설치는 가장 오래 걸리는 단계 중 하나입니다. 캐싱으로 대폭 단축할 수 있습니다.

### npm 캐시 (setup-node 내장)

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # package-lock.json 해시 기반 자동 캐싱
```

### 수동 캐시 설정 (더 세밀한 제어)

```yaml
- name: 캐시 복원
  uses: actions/cache@v4
  id: npm-cache
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: 의존성 설치
  if: steps.npm-cache.outputs.cache-hit != 'true'
  run: npm ci
```

### 빌드 캐시 (Next.js 예시)

```yaml
- name: Next.js 빌드 캐시
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ${{ github.workspace }}/.next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
```

---

## 7. 시크릿과 환경 변수 관리

### 시크릿 등록

GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret

```yaml
steps:
  - name: 배포
    env:
      API_KEY: ${{ secrets.API_KEY }}         # 시크릿
      NODE_ENV: production                     # 일반 환경변수
      APP_URL: ${{ vars.APP_URL }}            # Variables (비밀 아닌 설정값)
    run: |
      echo "API_KEY는 로그에 마스킹됩니다"
      npm run deploy
```

### 환경(Environment) 분리

```yaml
jobs:
  deploy-staging:
    environment: staging  # GitHub Environment 설정 사용
    steps:
      - run: echo "스테이징 배포"

  deploy-production:
    environment: production  # 다른 시크릿 세트 사용 + 승인 필요 설정 가능
    steps:
      - run: echo "프로덕션 배포"
```

### 동적 환경변수 (step 간 값 전달)

```yaml
steps:
  - name: 버전 추출
    id: version
    run: echo "value=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT

  - name: 태그 생성
    run: echo "버전은 ${{ steps.version.outputs.value }}"
```

---

## 8. 배포 파이프라인 예제

### Vercel 자동 배포

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Vercel 배포
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### GitHub Pages 배포 (Vite 프로젝트)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: GitHub Pages 배포
        id: deployment
        uses: actions/deploy-pages@v4
```

### Docker 이미지 빌드 & 푸시

```yaml
name: Docker Build & Push

on:
  push:
    tags: ['v*']

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Docker Hub 로그인
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: 메타데이터 추출
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: myuser/myapp
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: 빌드 & 푸시
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 9. 재사용 가능한 워크플로우

반복되는 워크플로우 로직을 별도 파일로 분리합니다.

### 재사용 워크플로우 정의

```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test

on:
  workflow_call:  # 다른 워크플로우에서 호출 가능
    inputs:
      node-version:
        required: false
        type: string
        default: '20'
    secrets:
      NPM_TOKEN:
        required: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci
      - run: npm test
```

### 재사용 워크플로우 호출

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:

jobs:
  run-tests:
    uses: ./.github/workflows/reusable-test.yml  # 로컬
    with:
      node-version: '20'
    secrets: inherit  # 부모의 시크릿 전달

  run-tests-v18:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '18'
```

---

## 10. 실전 팁 & 트러블슈팅

### PR에 자동 코멘트 달기

```yaml
- name: 테스트 결과 코멘트
  uses: actions/github-script@v7
  if: always()
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '✅ 테스트 통과! 커버리지: 87%'
      })
```

### 조건부 실행

```yaml
steps:
  - name: main 브랜치에서만 실행
    if: github.ref == 'refs/heads/main'
    run: npm run deploy

  - name: PR에서만 실행
    if: github.event_name == 'pull_request'
    run: npm run preview

  - name: 이전 스텝 실패해도 실행
    if: always()
    run: npm run cleanup

  - name: 파일 변경 시에만 실행
    if: contains(github.event.commits[0].modified, 'package.json')
    run: npm audit
```

### 자주 겪는 문제 해결

| 문제 | 원인 | 해결 |
|------|------|------|
| `Permission denied` | GITHUB_TOKEN 권한 부족 | `permissions:` 블록에서 필요한 권한 명시 |
| 캐시 미적용 | key가 매번 달라짐 | `hashFiles()` 패턴 확인 |
| 환경변수 미노출 | 시크릿 이름 오타 | Settings → Secrets에서 정확한 이름 확인 |
| 워크플로우 미실행 | 트리거 브랜치 불일치 | `on.push.branches` 패턴 재확인 |
| Job 타임아웃 | 기본 6시간 초과 | `timeout-minutes: 30` 설정 |

### 비용 최적화 팁

```yaml
jobs:
  test:
    runs-on: ubuntu-latest  # windows/macos는 요금이 더 비쌈

    # 중복 실행 방지
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
      cancel-in-progress: true  # 이전 실행 취소
```

---

## 정리

| 개념 | 핵심 |
|------|------|
| **Workflow** | `.github/workflows/*.yml` — 자동화 전체 |
| **Trigger** | `on:` — push, PR, schedule, 수동 등 |
| **Job** | 독립 실행 단위, `needs:`로 순차화 |
| **Step** | `uses:`(Action) 또는 `run:`(셸 명령) |
| **Secret** | 민감 정보는 반드시 `secrets.*` 사용 |
| **Cache** | `actions/cache` 또는 `setup-node cache:` |
| **Matrix** | 여러 환경 조합을 한 번에 테스트 |

GitHub Actions는 진입 장벽이 낮고 GitHub과 완전히 통합되어 있어 별도 CI 서버 없이 강력한 자동화를 구현할 수 있습니다. 먼저 간단한 테스트 자동화부터 시작해서 배포까지 단계적으로 확장해보세요.
