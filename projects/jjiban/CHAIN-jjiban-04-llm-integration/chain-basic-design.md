# Chain 기본설계: LLM Integration & Automation

## 문서 정보

| 항목 | 내용 |
|------|------|
| Chain ID | CHAIN-jjiban-04 |
| 관련 PRD | chain-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 시스템 구조

```
┌──────────────┐     WebSocket      ┌──────────────┐     PTY      ┌──────────────┐
│   Browser    │◄──────────────────►│   Backend    │◄────────────►│   LLM CLI    │
│  (xterm.js)  │   bidirectional    │  (node-pty)  │   stdin/out  │(claude, etc) │
└──────────────┘                    └──────────────┘              └──────────────┘
                                           │
                                           │ 로그 저장
                                           ▼
                                    ┌──────────────┐
                                    │  File System │
                                    │  (세션 로그)  │
                                    └──────────────┘
```

### 1.2 WebSocket 통신 프로토콜

```javascript
// Client → Server
{
  type: "input",
  sessionId: "abc123",
  data: "claude\n"
}

// Server → Client
{
  type: "output",
  sessionId: "abc123",
  data: "> Analyzing code...\n"
}

// Server → Client (파일 생성 감지)
{
  type: "file_created",
  sessionId: "abc123",
  filePath: "02-detail-design.md"
}
```

---

## 2. 주요 컴포넌트

### 2.1 Terminal Service (Backend)

```javascript
class TerminalService {
  sessions = new Map(); // sessionId → pty instance

  createSession(taskId) {
    const pty = spawn('bash', [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: `/project/jjiban/projects/${taskId}`,
      env: { ...process.env, ANTHROPIC_API_KEY: config.apiKey }
    });

    pty.on('data', (data) => {
      this.broadcast(sessionId, { type: 'output', data });
      this.detectFileChanges(data); // 파일 생성/수정 감지
    });

    this.sessions.set(sessionId, { pty, taskId });
    return sessionId;
  }

  write(sessionId, input) {
    const { pty } = this.sessions.get(sessionId);
    pty.write(input);
  }

  kill(sessionId) {
    const { pty } = this.sessions.get(sessionId);
    pty.kill();
    this.sessions.delete(sessionId);
  }
}
```

### 2.2 Workflow Automation Engine

```javascript
class WorkflowAutomationEngine {
  async runAutoPilot(taskId, mode = 'fully-automated') {
    const pipeline = [
      { stage: 'basic-design', command: 'start', prompt: 'basic-design-template' },
      { stage: 'detail-design', command: 'draft', prompt: 'detail-design-template' },
      { stage: 'design-review', command: 'plan', prompt: 'review-design-template' },
      { stage: 'implementation', command: 'build', prompt: 'implement-code-template' },
      { stage: 'code-review', command: 'audit', prompt: 'review-code-template' },
      { stage: 'integration-test', command: 'verify', prompt: 'run-tests-template' },
      { stage: 'complete', command: 'done', prompt: 'generate-manual-template' }
    ];

    for (const step of pipeline) {
      // 1. 상태 전환
      await this.workflowService.transition(taskId, step.command);

      // 2. LLM 실행
      const prompt = await this.promptService.render(step.prompt, { taskId });
      const result = await this.llmService.execute('claude', prompt);

      // 3. Human-in-the-Loop 모드: 승인 대기
      if (mode === 'human-in-the-loop') {
        await this.waitForApproval(taskId, step.stage);
      }

      // 4. 에러 발생 시 중단
      if (result.error) {
        throw new Error(`Failed at ${step.stage}: ${result.error}`);
      }
    }
  }
}
```

---

## 3. 프롬프트 템플릿 예시

### 3.1 기본 설계 템플릿

```markdown
---
name: basic-design-template
category: design
variables: [taskId, taskName, epicName]
---

# Task: {{taskName}}

당신은 소프트웨어 아키텍트입니다. 다음 Task에 대한 기본 설계를 작성해주세요:

**Task ID**: {{taskId}}
**Epic**: {{epicName}}

## 요구사항
{{{prdContent}}}

## 출력 형식
- 비즈니스 관점의 설계
- 주요 기능 목록
- 사용자 시나리오
- 예상 산출물
```

### 3.2 코드 구현 템플릿

```markdown
---
name: implement-code-template
category: implementation
variables: [taskId, designPath]
---

# Task 구현: {{taskName}}

당신은 전문 개발자입니다. 다음 설계 문서를 기반으로 코드를 작성해주세요:

**설계 문서**: {{designPath}}

## 설계 내용
{{{designContent}}}

## 요구사항
- TDD 방식으로 테스트 먼저 작성
- 코드 작성 후 E2E 테스트 실행
- 구현 문서 자동 생성 (05-implementation.md)

## 주의사항
- 보안 취약점 체크 (XSS, SQL Injection 등)
- 성능 최적화 고려
```

---

## 4. 보안 및 성능

### 4.1 보안 고려사항
- **API 키 관리**: 환경 변수로 저장, 클라이언트에 노출 금지
- **세션 격리**: Task별 독립 세션 (다른 Task 접근 불가)
- **명령어 제한**: 위험한 명령어 차단 (rm -rf, dd, format 등)
- **파일 접근 제한**: 프로젝트 루트 외부 접근 금지

### 4.2 성능 목표
- 터미널 응답 속도: < 500ms
- WebSocket 메시지 전송: < 100ms
- LLM CLI 시작 시간: < 2s
- 자동화 워크플로우 완료: < 30분 (Task당)

---

## 5. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
