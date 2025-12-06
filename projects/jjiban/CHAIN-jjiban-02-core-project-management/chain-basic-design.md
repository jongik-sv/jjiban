# Chain 기본설계: Core Project Management

## 문서 정보

| 항목 | 내용 |
|------|------|
| Chain ID | CHAIN-jjiban-02 |
| 관련 PRD | chain-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Kanban   │  │ Gantt    │  │ Task     │  │ Backlog   │  │
│  │ Board    │  │ Chart    │  │ Detail   │  │ Table     │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Issue    │  │ Gantt    │  │ Document │  │ Milestone │  │
│  │ Service  │  │ Service  │  │ Service  │  │ Service   │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │ Prisma ORM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               SQLite Database + File System                 │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Epic/Chain/  │  │ Markdown     │                        │
│  │ Module/Task  │  │ Documents    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 주요 컴포넌트
- **Kanban Board**: 드래그 앤 드롭 카드 UI (@dnd-kit/core ^6.x)
- **Gantt Chart**: 타임라인 시각화 (frappe-gantt ^1.0.x)
- **Task Detail**: 문서 통합 뷰 (react-markdown ^9.x)
- **Document Service**: 파일 시스템 읽기 및 렌더링

---

## 2. 데이터 모델

### 2.1 Prisma Schema (확장)

```prisma
// Milestone Model
model Milestone {
  id          String   @id @default(cuid())
  epicId      String
  name        String
  description String?
  targetDate  DateTime
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  epic  Epic   @relation(fields: [epicId], references: [id], onDelete: Cascade)
  tasks Task[] // M:N relation via taskMilestones
}

// Task-Milestone 관계 (M:N)
model TaskMilestone {
  taskId      String
  milestoneId String

  task      Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  milestone Milestone @relation(fields: [milestoneId], references: [id], onDelete: Cascade)

  @@id([taskId, milestoneId])
}
```

### 2.2 관계도

```
Epic (1) ────── (N) Milestone
                     │
                     │ (M:N via TaskMilestone)
                     │
                    (N) Task
```

---

## 3. API 설계

### 3.1 칸반 보드 APIs

| Method | 경로 | 설명 | 요청 | 응답 |
|--------|------|------|------|------|
| GET | `/api/board/:epicId` | 칸반 데이터 조회 | Query: `?status=dd&assignee=user1` | `{ columns: [{ status, tasks[] }] }` |
| PATCH | `/api/tasks/:id/status` | 드래그 앤 드롭 상태 변경 | `{ status: "im", statusSymbol: "[im]" }` | `{ task }` |
| POST | `/api/tasks/:id/move` | 컬럼 간 이동 | `{ fromStatus, toStatus, position }` | `{ success: true }` |

### 3.2 Gantt 차트 APIs

| Method | 경로 | 설명 | 요청 | 응답 |
|--------|------|------|------|------|
| GET | `/api/gantt/:epicId` | Gantt 데이터 조회 | - | `{ data: [{ id, text, start_date, duration, parent, progress }] }` |
| PATCH | `/api/tasks/:id/schedule` | 일정 변경 | `{ startDate, dueDate }` | `{ task }` |
| POST | `/api/tasks/:id/dependency` | 의존성 추가 | `{ predecessorId, type: "FS" }` | `{ dependency }` |

---

## 4. UI/UX 설계

### 4.1 칸반 보드 레이아웃

```
┌──────────────────────────────────────────────────────────────┐
│ [필터 ▼] [담당자 ▼] [타입 ▼]          🔍 검색...  [+ 이슈] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│ │ Todo   │ │ 상세   │ │ 구현   │ │ 리뷰   │ │ 완료   │     │
│ │   5    │ │   3    │ │   4    │ │   2    │ │  10    │     │
│ ├────────┤ ├────────┤ ├────────┤ ├────────┤ ├────────┤     │
│ │┌──────┐│ │┌──────┐│ │┌──────┐│ │┌──────┐│ │┌──────┐│     │
│ ││T-101 ││ ││T-098 ││ ││T-089 ││ ││T-087 ││ ││T-075 ││     │
│ ││OAuth ││ ││결제  ││ ││대시  ││ ││검색  ││ ││인증  ││     │
│ ││👤 홍 ││ ││👤 김 ││ ││👤 홍 ││ ││👤 박 ││ ││👤 이 ││     │
│ │└──────┘│ │└──────┘│ │└──────┘│ │└──────┘│ │└──────┘│     │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Gantt 차트 레이아웃

```
┌────────────────────────────────────────────────────────────────┐
│ [+ 만들기 ▼] [프로젝트 포함 ▼]        🔍  [⬚][🔍+][🔍-]      │
├─────────────────────────┬──────────────────────────────────────┤
│                         │   11월        12월        1월        │
│ ID  타입  제목    상태  │ 47 48 49 50 01 02 03 04 05 06 07    │
├─────────────────────────┼──────────────────────────────────────┤
│ 16 📦 EPIC  Website     │ ████████████████████████████████     │
│                         │                                      │
│ 22  📋 Feature Carousel │     ████████                         │
│                         │                                      │
│ 18   📖 Story Tour      │         ████████████                 │
│                         │                                      │
│ 20    ✅ Task Wireframe│                    ████████           │
└─────────────────────────┴──────────────────────────────────────┘
```

---

## 5. 보안 및 성능

### 5.1 보안 고려사항
- Task 접근 제어: 담당자 및 RBAC 기반 권한 체크
- 드래그 앤 드롭 API: CSRF 토큰 필수
- 문서 읽기: Path Traversal 방지 (documentPath 검증)

### 5.2 성능 목표
- 칸반 보드 렌더링: < 500ms (100개 카드)
- Gantt 차트 렌더링: < 1s (500개 Task)
- 드래그 앤 드롭 응답: < 200ms
- 검색 결과: < 300ms

**최적화 전략**:
- 가상 스크롤 (react-window)
- 메모이제이션 (React.memo, useMemo)
- 디바운싱 (검색 입력)
- 페이지네이션 또는 무한 스크롤

---

## 6. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
