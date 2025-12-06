# Module 기본설계: Security & Protection

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-06 |
| 관련 PRD | module-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 Security Layers
1. **Network Layer**: CORS (단, 로컬 앱이므로 느슨하게 설정 가능)
2. **Transport Layer**: HTTPS (운영 환경 권장, 로컬은 옵션)
3. **Application Layer**: Helmet, RateLimit, Validation (Zod)

---

## 2. 구현 가이드

### 2.1 Request Validation Middleware
```typescript
const validate = (schema: ZodSchema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (e) {
    res.status(400).json(e.errors);
  }
};
```

### 2.2 Zod Schema 예시
```typescript
const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
});
```

---

## 3. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
