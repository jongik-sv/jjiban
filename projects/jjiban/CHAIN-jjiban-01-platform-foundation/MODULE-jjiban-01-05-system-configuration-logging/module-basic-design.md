# Module 기본설계: System Configuration & Logging

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-05 |
| 관련 PRD | module-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 로깅 전략

```
[Request] -> [Logger Middleware] -> [Business Logic] -> [Response]
                                          |
                                      [Exception]
                                          |
                                   [Error Middleware] -> [Error Log]
```

### 1.2 Config 구조
- **Environment (.env)**: DB 접속 정보, Secret Key 등 민감 정보. (Build-time/Start-time)
- **Runtime Config (config.json)**: 사용자 설정, 테마, 언어 등 변경 가능한 설정. (Runtime)

---

## 2. 데이터 모델

### 2.1 Log Format (JSON)
```json
{
  "timestamp": "2025-12-06T10:00:00Z",
  "level": "error",
  "message": "User not found",
  "context": "UserService.getUser",
  "metadata": { "userId": "123" }
}
```

---

## 3. API 설계

### 3.1 Error Response 표준
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "사용자를 찾을 수 없습니다.",
    "details": null
  }
}
```

---

## 4. 구현 가이드

### 4.1 Custom Error Class
```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### 4.2 Logger Usage
```typescript
logger.info('Project created', { projectId: 1 });
logger.error('DB Connection Failed', err);
```

---

## 5. 테스트 전략

### 5.1 단위 테스트
- Config 유효성 검사 (Zod Schema Validation)
- Error Handler가 올바른 응답 포맷을 반환하는지 테스트

---

## 6. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
