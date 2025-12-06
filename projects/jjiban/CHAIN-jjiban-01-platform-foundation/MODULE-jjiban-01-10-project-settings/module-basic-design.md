# Module 기본설계: Project Settings

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-10 |
| 관련 PRD | module-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 Config Storage Strategy
프로젝트별 설정은 유연한 확장을 위해 JSON 형태로 DB에 저장합니다.

```prisma
model ProjectSettings {
  id        String   @id @default(cuid())
  epicId    String   @unique
  config    String   // JSON string: { "workflow": ["todo", "doing", "done"], "llm": "claude" }
  updatedAt DateTime @updatedAt
  
  epic      Epic     @relation(fields: [epicId], references: [id])
}
```

---

## 2. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
