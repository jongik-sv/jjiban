# 📄 교차 검증 보고서 - Task 3.1 Backend API 구현

**LLM Model:** Gemini (gemini-pro)
**Last Updated:** 2025-09-23

> **검증 요약**: 상세 설계 문서와 실제 구현 코드 간의 교차 검증 결과, 전반적인 일관성이 매우 높게 나타났습니다. 아키텍처, API 엔드포인트, 비즈니스 로직 대부분이 설계대로 정확히 구현되었습니다. 특히, 구현 단계의 개선사항이 설계 문서에 역으로 반영되는 등 이상적인 개발 프로세스를 보여주었습니다. 단, 하나의 명백한 결함과 몇 가지 사소한 개선점이 발견되었습니다.

---

## 1. 검증 개요 및 범위

- **검증 대상**: Task 3.1 - 마루 헤더 CRUD API
- **검증 범위**:
  - **문서**: `docs/project/maru/2. design/2. details/Task 3.1 Backend API 구현 - 마루 헤더 CRUD API.md`
  - **코드**: `backend/src/` 하위의 `routes`, `controllers`, `services`, `repositories`, `schemas` 관련 파일
- **검증 목표**: 설계-구현 간 불일치 식별, 코드 품질 및 보안 검증, 개선 제안 도출

---

## 2. 발견된 이슈 목록 (심각도/우선순위별)

| ID  | 심각도 | 우선순위 | 이슈 요약                               | 위치                                    | 담당자 | 상태 |
|:----|:-------|:---------|:----------------------------------------|:----------------------------------------|:-------|:-----|
| **BUG-001** | ❗ **High** | 🟠 **P2** | API로 전달된 `description` 필드가 DB에 저장되지 않음 | `MaruHeaderRepository.js`               | Backend | Open |
| **REF-001** | 📝 **Low** | 🟡 **P3** | `maruStatusSchema`가 두 파일에 중복으로 정의됨 | `schemas/maruSchema.js`, `schemas/maruStatusSchema.js` | Backend | Open |
| **REF-002** | ℹ️ **Info** | 🟢 **P4** | DB 연결 주입 방식 개선 제안             | `MaruHeaderRepository.js`               | Backend | Open |

---

## 3. 설계-구현 일관성 분석 결과

### 3.1. 긍정적 평가 (일치 항목)

- **아키텍처 일관성**: 설계된 3-Tier 아키텍처(Controller-Service-Repository)가 코드 구조에 완벽하게 구현되었습니다.
- **API 엔드포인트 일관성**: 설계된 8개의 API 엔드포인트(`MH001`~`MH008`)가 라우터에 모두 정확히 구현되었으며, 명시된 Joi 유효성 검증 미들웨어를 올바르게 사용합니다.
- **비즈니스 로직 일관성**: 선분 이력 관리, 상태 전환 규칙, 논리적 삭제 등 핵심 비즈니스 로직이 서비스 계층에 설계대로 구현되었습니다.
- **문서화**: 구현 단계에서 추가된 API(`history`, `at-date`)가 상세 설계 문서에 역으로 반영되어 있어, 문서와 코드의 정합성이 매우 높습니다.

### 3.2. 불일치 및 결함 분석 (BUG-001)

- **심각도**: ❗ **High**
- **우선순위**: 🟠 **P2 (빠른 해결)**
- **문제**:
  - `maruSchema.js`의 `maruCreateSchema`에는 `description` 필드가 정의되어 있어 API 요청 시 해당 필드를 받을 수 있습니다.
  - 하지만 `MaruHeaderRepository.js`의 `mapEntityToDbRow` 함수에서는 `description` 필드가 주석 처리되어 있어, 서비스 계층에서 전달받아도 실제 데이터베이스 쿼리에는 포함되지 않습니다.
- **영향**: 클라이언트는 `description`을 저장할 수 있다고 예상하지만, 실제로는 데이터가 유실됩니다. 이는 명백한 데이터 불일치 결함입니다.
- **코드 위치**:
  ```javascript
  // backend/src/repositories/MaruHeaderRepository.js - mapDbRowToEntity, mapEntityToDbRow

  // description: dbRow.DESCRIPTION, // DESCRIPTION 컬럼이 실제 테이블에 없음
  // if (entity.description !== undefined) dbRow.DESCRIPTION = entity.description; // DESCRIPTION 컬럼이 실제 테이블에 없음
  ```

---

## 4. 구체적 개선 제안

### 4.1. BUG-001: `description` 필드 저장 로직 수정 (P2)

- **개선 제안**:
  1.  `TB_MR_HEAD` 테이블에 `DESCRIPTION` 컬럼이 실제로 존재하는지 확인합니다.
  2.  컬럼이 존재한다면, `MaruHeaderRepository.js`의 `mapDbRowToEntity` 및 `mapEntityToDbRow` 함수에서 `DESCRIPTION` 관련 주석을 제거하여 필드가 정상적으로 매핑되도록 수정합니다.
  3.  컬럼이 존재하지 않는다면, 데이터베이스 마이그레이션을 통해 `DESCRIPTION` 컬럼을 추가하고 위 로직을 수정합니다.
- **예상 수정 코드**:
  ```javascript
  // backend/src/repositories/MaruHeaderRepository.js

  // 1. mapDbRowToEntity 수정
  mapDbRowToEntity(dbRow) {
    if (!dbRow) return null;
    return {
      // ... other fields
      description: dbRow.DESCRIPTION, // 주석 해제
      // ... other fields
    };
  }

  // 2. mapEntityToDbRow 수정
  mapEntityToDbRow(entity) {
    const dbRow = {};
    // ... other fields
    if (entity.description !== undefined) dbRow.DESCRIPTION = entity.description; // 주석 해제
    // ... other fields
    return dbRow;
  }
  ```

### 4.2. REF-001: Joi 스키마 중복 제거 (P3)

- **개선 제안**: `maruStatusSchema.js` 파일을 삭제하고, `maruSchema.js`에 정의된 `maruStatusSchema`를 모든 곳에서 `require`하여 사용하도록 통일합니다. 이는 코드의 중복을 제거하고 유지보수성을 향상시킵니다.
- **수정 대상**: `backend/src/routes/maruHeaders.js`의 `require` 경로 수정 및 `maruStatusSchema.js` 파일 삭제.

### 4.3. REF-002: Repository의 DB 연결 방식 개선 (P4)

- **개선 제안**: 현재 `getDb()` 메서드를 통해 필요시 DB 연결을 가져오는 방식도 동작하지만, 테스트 용이성과 명확성을 위해 생성자에서 DB 커넥션 객체를 주입받는 것을 기본으로 하고, 주입받지 않았을 때만 `getDb()`를 사용하도록 가이드하는 것이 좋습니다. 이는 이미 생성자(`constructor(database = null)`)에 구현되어 있으므로, 팀 내에서 사용 컨벤션을 정립하는 것을 권장합니다.

---

## 5. 우선순위별 실행 계획

1.  **P2 (빠른 해결)**:
    - **BUG-001**을 즉시 수정해야 합니다. 데이터 유실은 심각한 문제이므로 다음 배포 전에 반드시 해결해야 합니다.
2.  **P3 (보통 해결)**:
    - **REF-001**은 다음 코드 리팩토링 주기나 관련 파일 수정 시 함께 처리하는 것을 권장합니다.
3.  **P4 (개선 과제)**:
    - **REF-002**는 아키텍처의 일관성을 위한 장기적인 개선 과제로, 팀 내 논의를 통해 점진적으로 적용하는 것을 제안합니다.

---
**검증 완료.**