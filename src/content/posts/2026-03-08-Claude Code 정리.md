---
title: Claude Code 정리
date: 2026-03-08
summary: Anthropic의 AI 코딩 도구 Claude Code의 핵심 개념, 주요 기능, 슬래시 명령어, 훅 시스템, MCP 서버 연동까지 실전 활용법 총정리
tags: [claude-code, AI, anthropic, 개발도구, CLI, LLM, 코딩도구]
---

# Claude Code 정리

**Claude Code**는 Anthropic이 개발한 AI 기반 CLI 코딩 도우미입니다.
터미널에서 직접 실행되며, 코드 작성/수정/리팩토링/디버깅, 파일 시스템 탐색, Git 작업, 테스트 실행 등 소프트웨어 개발 전 과정을 자연어 대화로 처리할 수 있습니다.

> 목표: Claude Code의 **핵심 동작 원리**를 이해하고, **슬래시 명령어·훅·MCP** 등 고급 기능을 실전에서 활용하는 능력 키우기

---

## 목차

1. [Claude Code란?](#1-claude-code란)
2. [설치 및 초기 설정](#2-설치-및-초기-설정)
3. [기본 사용법](#3-기본-사용법)
4. [슬래시 명령어](#4-슬래시-명령어)
5. [키보드 단축키](#5-키보드-단축키)
6. [CLAUDE.md - 프로젝트 지시 파일](#6-claudemd---프로젝트-지시-파일)
7. [훅(Hooks) 시스템](#7-훅hooks-시스템)
8. [MCP 서버 연동](#8-mcp-서버-연동)
9. [권한 및 보안 모드](#9-권한-및-보안-모드)
10. [멀티 에이전트 & 서브에이전트](#10-멀티-에이전트--서브에이전트)
11. [메모리 관리](#11-메모리-관리)
12. [Best Practices](#12-best-practices)

---

## 1. Claude Code란?

### 1.1 주요 특징

| 특징 | 설명 |
|------|------|
| **터미널 네이티브** | 브라우저 없이 CLI에서 바로 실행 |
| **파일 시스템 접근** | 프로젝트 코드를 직접 읽고 수정 |
| **명령 실행** | 빌드·테스트·Git 명령을 자율적으로 실행 |
| **대화형 협업** | 자연어로 지시 → AI가 코드 작업 처리 |
| **컨텍스트 인식** | 현재 디렉토리·Git 상태·파일 구조 자동 파악 |

### 1.2 기존 도구와의 차이

```
GitHub Copilot  → IDE 내 자동완성 중심
Cursor          → 편집기 통합 AI
Claude Code     → 터미널 CLI 기반, 자율 작업 에이전트
```

Claude Code는 단순 자동완성이 아니라, **태스크를 스스로 계획하고 실행하는 에이전트**입니다.

---

## 2. 설치 및 초기 설정

### 2.1 설치

```bash
# npm 전역 설치
npm install -g @anthropic-ai/claude-code

# 또는 npx로 바로 실행
npx @anthropic-ai/claude-code
```

### 2.2 인증

```bash
claude login
# 브라우저가 열리며 Anthropic 계정으로 OAuth 인증
```

API Key를 직접 사용하려면:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

### 2.3 실행

```bash
# 대화형 모드 시작
claude

# 단일 쿼리 실행 후 종료 (비대화형)
claude -p "이 프로젝트의 README를 작성해줘"

# 특정 디렉토리에서 실행
claude --cwd /path/to/project
```

---

## 3. 기본 사용법

### 3.1 대화형 세션

```
> 이 프로젝트에 어떤 파일이 있나요?
> src/utils.ts의 formatDate 함수를 수정해주세요
> 테스트를 실행하고 실패 원인을 분석해줘
> Git에 변경사항을 커밋해줘
```

Claude Code는 자동으로:
- 관련 파일을 읽고 분석
- 코드를 수정하거나 새 파일 생성
- 터미널 명령 실행 (사용자 승인 필요)
- 결과를 요약하여 보고

### 3.2 파이프라인 활용

```bash
# 파일 내용을 컨텍스트로 전달
cat error.log | claude -p "이 에러를 분석해줘"

# 여러 파일을 처리
claude -p "모든 .ts 파일의 any 타입을 제거해줘"
```

### 3.3 이미지 입력

```bash
# 스크린샷을 분석하여 코드 생성
claude -p "이 UI 스크린샷과 동일한 컴포넌트를 React로 만들어줘" --image screenshot.png
```

---

## 4. 슬래시 명령어

대화 중 `/` 로 시작하는 명령어를 입력해 Claude Code 기능을 제어합니다.

### 4.1 기본 명령어

| 명령어 | 설명 |
|--------|------|
| `/help` | 도움말 표시 |
| `/clear` | 대화 컨텍스트 초기화 |
| `/exit` | Claude Code 종료 |
| `/status` | 현재 상태 표시 |
| `/model` | 사용 모델 확인·변경 |

### 4.2 파일 & 컨텍스트

| 명령어 | 설명 |
|--------|------|
| `/add <파일>` | 특정 파일을 컨텍스트에 추가 |
| `/compact` | 대화 히스토리를 압축하여 컨텍스트 절약 |

### 4.3 작업 제어

| 명령어 | 설명 |
|--------|------|
| `/undo` | 마지막 파일 변경 취소 |
| `/diff` | 현재 변경사항 diff 표시 |
| `/review` | 코드 리뷰 요청 |
| `/commit` | Git 커밋 생성 |
| `/pr` | Pull Request 생성 |

### 4.4 모드 전환

| 명령어 | 설명 |
|--------|------|
| `/plan` | 계획 모드 진입 (코드 수정 전 계획만 수립) |
| `/fast` | Fast 모드 토글 (더 빠른 응답) |

### 4.5 커스텀 슬래시 명령어

`.claude/commands/` 디렉토리에 마크다운 파일로 정의합니다:

```markdown
<!-- .claude/commands/review-pr.md -->
현재 PR의 변경사항을 검토하고, 잠재적 버그·성능 문제·코드 스타일 위반을 분석하여 개선안을 제안해주세요.
```

이후 `/review-pr` 명령어로 실행 가능합니다.

---

## 5. 키보드 단축키

| 단축키 | 기능 |
|--------|------|
| `Enter` | 메시지 전송 |
| `Shift+Enter` | 줄바꿈 (멀티라인 입력) |
| `Ctrl+C` | 현재 응답 중단 |
| `Ctrl+Z` | 전체 세션 종료 |
| `↑ / ↓` | 이전/다음 입력 히스토리 |
| `Esc` | 편집 취소 |

---

## 6. CLAUDE.md - 프로젝트 지시 파일

### 6.1 개요

`CLAUDE.md`는 Claude Code가 자동으로 읽는 **프로젝트별 지시서**입니다.
팀 컨벤션, 주의사항, 자주 쓰는 명령어 등을 기록해 두면 매 세션마다 반복 설명 없이 바로 작업 가능합니다.

### 6.2 파일 위치

| 경로 | 적용 범위 |
|------|----------|
| `~/.claude/CLAUDE.md` | 전역 (모든 프로젝트) |
| `<프로젝트루트>/CLAUDE.md` | 해당 프로젝트 |
| `<서브디렉토리>/CLAUDE.md` | 해당 디렉토리 |

### 6.3 작성 예시

```markdown
# 프로젝트 지시사항

## 기술 스택
- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS
- 상태관리: Zustand
- 패키지 매니저: pnpm (npm, yarn 사용 금지)

## 코드 컨벤션
- 컴포넌트: PascalCase, 파일명도 동일
- 훅: use 접두사
- 함수: camelCase
- 상수: UPPER_SNAKE_CASE

## 금지 사항
- console.log를 커밋에 포함하지 말 것
- any 타입 사용 금지
- 테스트 없이 비즈니스 로직 수정 금지

## 자주 쓰는 명령어
- 개발 서버: pnpm dev
- 빌드: pnpm build
- 테스트: pnpm test
- 린트: pnpm lint

## Git 규칙
- 브랜치: feature/기능명, fix/버그명
- 커밋 메시지: 한국어로, feat/fix/refactor/docs 접두사 사용
```

---

## 7. 훅(Hooks) 시스템

### 7.1 개요

훅은 Claude Code의 특정 이벤트 발생 시 **자동으로 실행되는 쉘 명령어**입니다.
코드 변경 후 자동 포맷팅, 커밋 전 린트 실행, 알림 발송 등을 자동화할 수 있습니다.

### 7.2 훅 설정 위치

```
~/.claude/settings.json         # 전역 설정
<프로젝트>/.claude/settings.json  # 프로젝트 설정
```

### 7.3 훅 이벤트 종류

| 이벤트 | 발생 시점 |
|--------|----------|
| `PreToolUse` | 도구 실행 직전 |
| `PostToolUse` | 도구 실행 직후 |
| `Notification` | Claude가 알림을 보낼 때 |
| `Stop` | 응답 완료 후 |
| `SubagentStop` | 서브에이전트 완료 후 |
| `PreCompact` | 컨텍스트 압축 직전 |

### 7.4 훅 설정 예시

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "prettier --write $CLAUDE_TOOL_INPUT_PATH"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code 작업 완료\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

### 7.5 훅 환경 변수

| 변수 | 설명 |
|------|------|
| `CLAUDE_TOOL_NAME` | 실행된 도구 이름 |
| `CLAUDE_TOOL_INPUT_PATH` | 도구에 전달된 파일 경로 |
| `CLAUDE_TOOL_OUTPUT` | 도구 실행 결과 |
| `CLAUDE_SESSION_ID` | 현재 세션 ID |

---

## 8. MCP 서버 연동

### 8.1 MCP란?

**Model Context Protocol(MCP)**은 Claude가 외부 도구·데이터 소스와 표준화된 방식으로 통신하는 프로토콜입니다.
MCP 서버를 연결하면 Claude Code가 데이터베이스 조회, Slack 메시지 발송, GitHub API 호출 등을 직접 수행할 수 있습니다.

### 8.2 MCP 서버 추가

```bash
# stdio 방식 (로컬 프로세스)
claude mcp add my-server node /path/to/server.js

# SSE 방식 (HTTP 서버)
claude mcp add my-server --transport sse http://localhost:3000

# 환경변수 전달
claude mcp add github-server -e GITHUB_TOKEN=ghp_xxx node github-mcp.js
```

### 8.3 설정 파일 방식

```json
// .claude/settings.json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxx"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/mydb"
      }
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-xxx"
      }
    }
  }
}
```

### 8.4 주요 공식 MCP 서버

| 서버 | 기능 |
|------|------|
| `@modelcontextprotocol/server-github` | GitHub 이슈·PR·파일 조작 |
| `@modelcontextprotocol/server-postgres` | PostgreSQL 쿼리 실행 |
| `@modelcontextprotocol/server-slack` | Slack 채널 읽기·메시지 발송 |
| `@modelcontextprotocol/server-filesystem` | 파일 시스템 확장 접근 |
| `@modelcontextprotocol/server-brave-search` | Brave 웹 검색 |
| `@modelcontextprotocol/server-puppeteer` | 브라우저 자동화 |

---

## 9. 권한 및 보안 모드

### 9.1 권한 모드

| 모드 | 설명 |
|------|------|
| **기본 모드** | 위험한 작업마다 사용자 승인 요청 |
| `--dangerously-skip-permissions` | 모든 작업 자동 승인 (CI/CD용) |
| `--allowedTools` | 허용 도구 명시적 지정 |

### 9.2 허용 도구 설정

```bash
# 파일 읽기와 bash 실행만 허용
claude --allowedTools "Read,Bash"

# 특정 bash 명령만 허용
claude --allowedTools "Read,Edit,Bash(git log:git diff)"
```

### 9.3 설정 파일로 권한 관리

```json
// .claude/settings.json
{
  "permissions": {
    "allow": [
      "Read",
      "Edit",
      "Bash(npm run*)",
      "Bash(git log*)",
      "Bash(git diff*)"
    ],
    "deny": [
      "Bash(rm -rf*)",
      "Bash(git push --force*)"
    ]
  }
}
```

---

## 10. 멀티 에이전트 & 서브에이전트

### 10.1 개요

Claude Code는 복잡한 태스크를 여러 **서브에이전트(Sub-agent)**로 분산 처리할 수 있습니다.
병렬 실행으로 시간을 단축하고, 각 에이전트가 독립적인 컨텍스트를 가져 주 컨텍스트를 보호합니다.

### 10.2 서브에이전트 사용 예시

```
> 이 프로젝트의 모든 컴포넌트를 분석하고, 성능 문제가 있는 파일을 찾아서 수정해줘
```

Claude Code가 내부적으로:
1. **Explore 에이전트** → 컴포넌트 파일 목록 파악
2. **분석 에이전트들** → 각 파일을 병렬로 분석
3. **수정 에이전트** → 문제 파일 수정
4. **검증 에이전트** → 수정 결과 확인

### 10.3 에이전트 유형

| 에이전트 | 용도 |
|---------|------|
| `general-purpose` | 복잡한 멀티스텝 리서치·실행 |
| `Explore` | 빠른 코드베이스 탐색 |
| `Plan` | 구현 전략 설계 |

---

## 11. 메모리 관리

### 11.1 메모리 저장 위치

```
~/.claude/projects/<프로젝트명>/memory/
├── MEMORY.md        # 항상 자동 로드 (200줄 이내 권장)
├── debugging.md     # 디버깅 인사이트
└── patterns.md      # 코드 패턴 메모
```

### 11.2 메모리 활용

- `MEMORY.md`에 프로젝트 패턴, 자주 쓰는 해결책, 사용자 선호도 기록
- 세션이 종료되어도 다음 대화에서 자동 참조
- 대화 중 "이걸 기억해줘"라고 요청하면 메모리에 저장

---

## 12. Best Practices

### 12.1 효과적인 지시 방법

```
# 나쁜 예
"코드 고쳐줘"

# 좋은 예
"src/components/UserCard.tsx의 렌더링 성능이 떨어집니다.
useMemo와 useCallback을 적절히 적용하여 불필요한 리렌더링을 방지해주세요.
수정 후 변경 이유를 설명해주세요."
```

### 12.2 CLAUDE.md 적극 활용

- 프로젝트 시작 시 `CLAUDE.md` 먼저 작성
- 팀 컨벤션, 금지 사항, 자주 쓰는 명령어 기록
- 반복 설명 없이 일관된 작업 가능

### 12.3 컨텍스트 관리

```bash
# 컨텍스트가 너무 길어지면
/compact       # 대화 압축

# 새 작업 시작 시
/clear         # 컨텍스트 초기화

# 특정 파일만 포함하여 집중
/add src/specific-file.ts
```

### 12.4 단계별 작업 진행

```
1. /plan 명령으로 계획 먼저 확인
2. 계획 승인 후 실행
3. 변경사항 /diff로 검토
4. /commit으로 커밋
```

### 12.5 CI/CD 통합

```yaml
# GitHub Actions 예시
- name: Claude Code 자동 리뷰
  run: |
    npx @anthropic-ai/claude-code \
      --dangerously-skip-permissions \
      -p "PR의 변경사항을 검토하고 잠재적 버그를 찾아 코멘트를 달아줘"
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 12.6 주의사항

- `--dangerously-skip-permissions`는 CI/CD 환경에서만 사용
- 민감한 정보(API 키 등)를 대화에 직접 입력하지 말 것
- 대규모 파일 삭제 등 되돌리기 어려운 작업은 항상 확인 후 실행
- Git 커밋 전 `/diff`로 변경사항 반드시 검토

---

## 참고

- [공식 문서](https://docs.anthropic.com/claude-code)
- [GitHub](https://github.com/anthropics/claude-code)
- [Claude API 문서](https://docs.anthropic.com/api)
