# 사용자 매뉴얼 (080-manual.md)

**Version:** 1.0.0 — **Last Updated:** 2025-12-26

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-03 |
| Task명 | 워크플로우 명령어 훅 |
| 대상 사용자 | 개발자, jjiban 사용자 |

---

## 1. 개요

### 1.1 기능 소개

워크플로우 명령어(`/wf:*`) 실행 시 자동으로 실행 상태를 서버에 등록/해제하는 기능입니다. 이를 통해 웹 UI에서 현재 실행 중인 Task를 실시간으로 추적할 수 있습니다.

### 1.2 주요 기능

| 기능 | 설명 |
|------|------|
| exec start | 워크플로우 실행 시작 등록 |
| exec stop | 워크플로우 실행 종료 등록 |
| 자동 훅 | wf 명령어 실행 시 자동 호출 |

---

## 2. 시작하기

### 2.1 사전 요구사항

| 항목 | 요구사항 |
|------|----------|
| Node.js | v20.0.0 이상 |
| jjiban | 설치됨 |
| API 서버 | localhost:3000 (선택) |

### 2.2 설치

jjiban이 설치되어 있으면 추가 설치 없이 사용 가능합니다.

```bash
# 설치 확인
npx jjiban exec --help
```

---

## 3. 사용 방법

### 3.1 수동 사용

#### exec start

워크플로우 실행 시작을 등록합니다.

```bash
npx jjiban exec start <taskId> <command> [options]
```

**매개변수:**

| 매개변수 | 필수 | 설명 | 예시 |
|----------|------|------|------|
| taskId | ✅ | Task ID | TSK-01-01 |
| command | ✅ | 워크플로우 명령어명 | build, verify |
| --session | ❌ | 터미널 세션 ID | term-123 |
| --pid | ❌ | 터미널 프로세스 PID | 12345 |

**예시:**

```bash
# 기본 사용
npx jjiban exec start TSK-01-01 build

# 세션 정보 포함
npx jjiban exec start TSK-01-01 build --session term-abc --pid 12345
```

#### exec stop

워크플로우 실행 종료를 등록합니다.

```bash
npx jjiban exec stop <taskId>
```

**예시:**

```bash
npx jjiban exec stop TSK-01-01
```

### 3.2 자동 훅 (wf 명령어)

`/wf:*` 명령어 실행 시 자동으로 훅이 호출됩니다.

```
/wf:build TSK-01-01 실행
  ↓
[자동] npx jjiban exec start TSK-01-01 build
  ↓
... 워크플로우 실행 ...
  ↓
[자동] npx jjiban exec stop TSK-01-01
```

### 3.3 환경변수 설정

터미널 세션에서 환경변수를 설정하면 자동으로 사용됩니다.

| 환경변수 | 용도 | 예시 |
|----------|------|------|
| JJIBAN_SESSION_ID | 터미널 세션 ID | term-uuid-1234 |
| JJIBAN_TERMINAL_PID | 터미널 프로세스 PID | 12345 |
| JJIBAN_API_URL | API 서버 URL | http://localhost:3000 |
| JJIBAN_API_TIMEOUT | API 타임아웃(ms) | 5000 |

**우선순위**: CLI 옵션 > 환경변수 > 기본값

---

## 4. FAQ

### Q1: API 서버가 없어도 사용할 수 있나요?

**A**: 예. API 호출이 실패해도 경고만 출력하고 워크플로우는 계속 진행됩니다.

### Q2: taskId 형식이 맞지 않으면 어떻게 되나요?

**A**: 경고 메시지가 출력되고 API 호출이 스킵됩니다. 워크플로우는 계속 진행됩니다.

```
[exec] 경고: 잘못된 taskId 형식: invalid-id
```

### Q3: 환경변수가 없으면 어떻게 되나요?

**A**: 경고 메시지가 출력되지만 워크플로우는 계속 진행됩니다.

```
[exec] 경고: sessionId가 없습니다 (--session 또는 $JJIBAN_SESSION_ID)
```

---

## 5. 문제 해결

### 5.1 "잘못된 taskId 형식" 경고

**증상**: `[exec] 경고: 잘못된 taskId 형식: ...`

**원인**: Task ID가 `TSK-XX-XX` 또는 `TSK-XX-XX-XX` 형식이 아님

**해결**: 올바른 형식의 Task ID 사용

```bash
# 올바른 형식
TSK-01-01      # 3단계
TSK-01-01-01   # 4단계

# 잘못된 형식
TSK-1-1        # 숫자가 2자리가 아님
task-01-01     # 접두사가 TSK가 아님
```

### 5.2 API 연결 실패

**증상**: `[exec] 경고: API 호출 실패 - ...`

**원인**: API 서버 미기동 또는 네트워크 문제

**해결**:
1. jjiban 웹 서버 실행 확인: `npx jjiban`
2. 기본 포트(3000) 확인
3. JJIBAN_API_URL 환경변수 확인

---

## 6. 참고 자료

| 문서 | 경로 |
|------|------|
| PRD | `.jjiban/projects/jjiban개선/prd.md` 섹션 9.6, 9.7 |
| 상세설계 | `020-detail-design.md` |
| 구현 보고서 | `030-implementation.md` |
| 통합테스트 | `070-integration-test.md` |

---

## 7. 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 1.0.0 | 2025-12-26 | 최초 작성 |

---

<!--
author: Claude
Version: 1.0.0
-->
