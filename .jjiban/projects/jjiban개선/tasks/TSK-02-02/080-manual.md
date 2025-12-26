# 사용자 매뉴얼 (080-manual.md)

**Version:** 1.0.0 — **Last Updated:** 2025-12-26

---

## 1. 개요

### 1.1 기능 소개

워크플로우 프롬프트 생성 기능은 Task 상세 화면에서 워크플로우 버튼을 클릭할 때 Claude Code에 적절한 명령어를 전달하는 기능입니다.

**주요 기능**:
- `/wf:build`, `/wf:start` 등 워크플로우 명령어 프롬프트 생성
- Claude Code 세션을 통한 자동 실행
- Task 상태/카테고리에 따른 사용 가능 명령어 필터링 API

### 1.2 대상 사용자

- jjiban을 사용하는 개발자
- 워크플로우 자동화를 활용하는 사용자

---

## 2. 시작하기

### 2.1 사전 요구사항

- Claude Code CLI가 설치되어 있어야 합니다
- 터미널 시스템이 활성화되어 있어야 합니다 (TSK-04-01 완료 후)

### 2.2 접근 방법

```
WBS 페이지 → Task 선택 → 상세 패널 → 워크플로우 버튼 클릭
```

---

## 3. 사용 방법

### 3.1 버튼 클릭으로 명령어 실행

1. WBS 페이지에서 Task 선택
2. 오른쪽 상세 패널에서 활성화된 워크플로우 버튼 클릭
3. Claude Code가 자동으로 해당 명령어 실행

### 3.2 생성되는 프롬프트 형식

| 명령어 | Task ID | 생성되는 프롬프트 |
|--------|---------|------------------|
| build | TSK-01-01 | `/wf:build TSK-01-01` |
| start | TSK-02-01 | `/wf:start TSK-02-01` |
| run | (무관) | `/wf:run` |
| auto | TSK-01-01 | `/wf:auto TSK-01-01` |

### 3.3 사용 가능 명령어 API

```bash
GET /api/workflow/available-commands/{taskId}?project={projectId}
```

**응답 예시**:
```json
{
  "success": true,
  "commands": [
    {
      "name": "build",
      "label": "구현",
      "available": true
    }
  ],
  "task": {
    "status": "[ap]",
    "category": "development"
  }
}
```

---

## 4. FAQ

### Q1. 버튼을 클릭해도 Claude Code가 실행되지 않습니다.

터미널 시스템이 구현되어야 합니다 (TSK-04-01). 현재는 프롬프트 생성까지만 동작합니다.

### Q2. 특정 명령어 버튼이 비활성화되어 있습니다.

현재 Task 상태에서 해당 명령어를 사용할 수 없습니다. 워크플로우 순서에 따라 이전 단계를 먼저 완료하세요.

---

## 5. 문제 해결

| 증상 | 원인 | 해결방법 |
|------|------|----------|
| API 404 | Task ID 오류 | Task ID 확인 |
| 프롬프트 미생성 | taskId 누락 | Task 선택 후 재시도 |

---

## 6. 참고 자료

- 기본설계: `010-basic-design.md`
- 상세설계: `020-detail-design.md`
- 구현 보고서: `030-implementation.md`

---

<!--
author: Claude
Version: 1.0.0
-->