# Module PRD: Real-time Collaboration & Notification

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-08 |
| Module 이름 | Real-time Collaboration & Notification |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| Module 유형 | User Story |
| 예상 기간 | 2주 |
| 상위 Chain | Platform Foundation |
| 원본 Chain PRD | ../chain-prd.md |

---

## 1. Module 개요

### 1.1 User Story
**"As a 팀원, I want 동료의 활동을 실시간으로 확인하고 중요한 알림을 받고 싶다 so that 중복 작업을 피하고 빠르게 소통할 수 있다"**

프로젝트 협업 시 실시간성이 중요합니다. Socket.IO를 활용하여 누가 접속해 있는지, 어떤 작업을 하고 있는지(수정 중 등)를 표시하고, Task 할당이나 댓글 등의 이벤트를 즉시 알림으로 전달합니다.

### 1.2 범위 (Scope)

**포함:**
- WebSocket 서버 (Socket.IO)
- 클라이언트 Socket 연결 및 재연결 관리
- 사용자 Presence (접속 상태) 표시
- 인앱 알림 센터 (Notification List)
- Toast 알림 (일시적 메시지)
- 알림 데이터베이스 저장 (영구 보관)

**제외:**
- 화상/음성 채팅
- 실시간 텍스트 동시 편집 (OT/CRDT - 복잡도 높음, 추후 고려)

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] 다른 사용자가 접속 시 온라인 표시가 즉시 업데이트됨
- [ ] Task 할당 시 담당자에게 즉시 Toast 알림 표시
- [ ] 오프라인 상태에서 발생한 알림은 재접속 시 확인 가능 (DB 저장)
- [ ] 알림 읽음 처리 기능

---

## 2. Task 목록

### TASK-jjiban-01-08-01: Socket.IO Server 구축 (1일)
**설명**: "실시간 통신 서버 설정"

**작업 내용**:
- Express 서버에 Socket.IO 통합
- Auth Middleware 연동 (JWT 검증)
- Connection/Disconnection 핸들링

**완료 조건**:
- [ ] 인증된 사용자만 소켓 연결 성공
- [ ] 연결 해제 시 로그 기록

---

### TASK-jjiban-01-08-02: Presence System 구현 (1.5일)
**설명**: "사용자 접속 상태 추적"

**작업 내용**:
- `online-users` 메모리 저장소 관리 (Redis 또는 In-memory)
- 사용자 입장/퇴장 브로드캐스트
- 프론트엔드 아바타에 초록불 표시

**완료 조건**:
- [ ] 다른 브라우저에서 로그인 시 즉시 리스트 반영

---

### TASK-jjiban-01-08-03: Notification Service (Backend) (1.5일)
**설명**: "알림 생성 및 조회 API"

**작업 내용**:
- Notification DB 모델 정의
- 알림 생성 함수 (`notifyUser(userId, type, payload)`) 구현
- 알림 목록 조회 API (`GET /api/notifications`)

**완료 조건**:
- [ ] DB에 알림 저장 확인
- [ ] 소켓으로 실시간 전송 확인

---

### TASK-jjiban-01-08-04: Notification UI 구현 (2일)
**설명**: "알림 센터 및 Toast"

**작업 내용**:
- 헤더의 종 모양 아이콘 및 배지(Badge)
- 드롭다운 알림 목록 컴포넌트
- Ant Design Notification 활용 Toast 연동

**완료 조건**:
- [ ] 새 알림 도착 시 배지 카운트 증가
- [ ] Toast 클릭 시 해당 Task로 이동

---

## 3. 의존성

### 3.1 선행 Modules
- MODULE-jjiban-01-04: Auth (사용자 식별)

### 3.2 후행 Modules
- CHAIN-02, 03 (이 모듈을 통해 알림 발송)

### 3.3 외부 의존성
- Socket.IO
- Socket.IO Client

---

## 4. 주요 화면/API 목록

### 4.1 화면 목록
| 화면 이름 | 경로 | 설명 | 관련 Task |
|----------|------|------|-----------|
| 알림 센터 | (Header) | 알림 목록 | TASK-04 |

### 4.2 API 목록
| API | Method | 경로 | 설명 | 관련 Task |
|-----|--------|------|------|-----------|
| 알림 조회 | GET | `/api/notifications` | 내 알림 | TASK-03 |
| 읽음 처리 | PUT | `/api/notifications/:id` | 읽음 표시 | TASK-03 |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| WS | Socket.IO | v4.x |
| Store | In-memory | 로컬 버전이라 Redis 불필요 |

---

## 6. 참조 문서

- 상위 Chain PRD: ../chain-prd.md

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
