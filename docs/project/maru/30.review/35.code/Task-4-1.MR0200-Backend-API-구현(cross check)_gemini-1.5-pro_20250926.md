# 교차 검증 보고서: Task 4.1 MR0200 Backend API 구현

**LLM:** `gemini-1.5-pro`
**검증 일시:** 2025년 9월 26일

---

## 1. 검증 개요 및 범위

### 1.1. 목적
본 문서는 **Task 4.1: MR0200(마루 현황 조회) Backend API 구현**에 대한 상세 설계와 실제 구현 코드 간의 일관성을 교차 검증하고, 발견된 불일치 사항에 대한 개선 방안을 제시하는 것을 목적으로 합니다.

### 1.2. 검증 범위
- **상세 설계 문서**: `docs/project/maru/10.design/12.detail-design/Task-4-1.MR0200-Backend-API-구현(상세설계).md`
- **구현 소스 코드**:
    - `backend/src/routes/maruOverview.js`
    - `backend/src/routes/maruHeaders.js`
    - `backend/src/controllers/MaruOverviewController.js`
    - `backend/src/services/MaruOverviewService.js`
    - `backend/src/repositories/MaruHeaderRepository.js`
    - `backend/src/repositories/MaruHeaderRepository.extended.js`

### 1.3. 중점 검증 항목
- API 엔드포인트 및 파라미터 일치 여부
- 필터, 정렬, 페이징 로직 구현 정확성
- 캐시 전략 구현 적절성
- 데이터베이스 쿼리 및 모델 매핑 일관성

---

## 2. 발견된 이슈 목록 (요약)

| 이슈 ID | 내용 | 심각도 | 우선순위 | 상태 |
| :--- | :--- | :--- | :--- | :--- |
| **ISSUE-001** | **마루 목록 조회 API 파라미터 누락** | ⚠️ **Critical** | 🔴 **P1 (즉시 해결)** | **Open** |
| **ISSUE-002** | 캐시 클리어 API 설계 미반영 | 📝 **Low** | 🟡 **P3 (보통 해결)** | **Open** |
| **ISSUE-003** | 파일/클래스 네이밍 불일치 | ℹ️ **Info** | 🟢 **P4 (개선 과제)** | **Open** |

---

## 3. 상세 분석 내용

### 3.1. ISSUE-001: 마루 목록 조회 API 파라미터 누락 (Critical, P1)

**현상:**
MR0200 화면의 핵심 기능인 **마루 목록의 다중 필터, 검색, 정렬 기능이 동작하지 않습니다.**

**원인 분석:**
가장 큰 원인은 **API 엔드포인트(라우터)와 데이터베이스 접근 계층(레포지토리) 간의 명백한 단절**입니다.

1.  **레포지토리 계층 (`MaruHeaderRepository.extended.js`)**:
    - 상세 설계 문서에 명시된 모든 요구사항(페이지네이션, 상태/유형/우선순위 필터, 기간 검색, 이름/ID 검색, 복합 정렬)을 완벽하게 처리하는 `findPagedWithValidation` 메소드가 **성공적으로 구현**되어 있습니다.
    - 이는 백엔드의 가장 깊은 곳에서는 화면의 모든 요구사항을 처리할 준비가 되어 있음을 의미합니다.

2.  **라우터 계층 (`maruHeaders.js`)**:
    - API의 입구인 `GET /api/v1/maru-headers` 라우트는 `listQuerySchema`라는 Joi 스키마를 통해 쿼리 파라미터를 검증합니다.
    - 하지만 이 스키마에는 `page`, `limit`, `search`, `sortBy`, `sortOrder`와 같은 **기본적인 파라미터만 정의**되어 있습니다.
    - 상세 설계의 핵심인 `status`, `type`, `priority`, `validation`, `sort` 등 **대부분의 필터/정렬 파라미터가 누락**되어 있습니다.

**결론:**
백엔드 레포지토리는 복잡한 조회를 수행할 능력이 있지만, API의 입구인 라우터가 필요한 파라미터를 받지 않고 막고 있어 **기능이 완전히 차단된 상태**입니다. 이는 요구사항 `REQ-MR0200-API-001`과 `REQ-MR0200-API-002`를 정면으로 위배하는 심각한 결함입니다.

### 3.2. ISSUE-002: 캐시 클리어 API 설계 미반영 (Low, P3)

**현상:**
`DELETE /api/v1/maru-overview/cache`라는 API가 구현되어 있으나, 상세 설계 문서에는 해당 내용이 없습니다.

**분석:**
해당 API는 현황 통계 캐시를 수동으로 삭제하는 기능으로, 개발 및 테스트 단계에서 캐시 동작을 검증하기 위한 유용한 편의 기능으로 판단됩니다. 운영 환경에서 직접 사용될 가능성은 낮지만, 기능이 존재하는 이상 문서화는 필요합니다.

**결론:**
기능상 문제는 없으나, 설계와 구현의 일관성을 위해 설계 문서에 해당 API 명세를 역으로 반영하는 것이 권장됩니다.

### 3.3. ISSUE-003: 파일/클래스 네이밍 불일치 (Info, P4)

**현상:**
설계와 구현 간에 일부 파일 및 클래스 이름이 일치하지 않습니다.

-   **라우트 파일**: `maruOverview.routes.js` (설계) vs `maruOverview.js` (구현)
-   **레포지토리 클래스**: `MaruHeadRepository` (설계) vs `MaruHeaderRepository` (구현)

**결론:**
기능에 직접적인 영향을 주지는 않지만, 프로젝트의 일관성과 가독성을 저해할 수 있습니다. 향후 유지보수 과정에서 혼란을 줄 수 있으므로 네이밍 컨벤션을 통일하는 것이 좋습니다.

---

## 4. 구체적 개선 제안

### 4.1. ISSUE-001 해결 방안 (P1 - 즉시 수정 필요)

**핵심 목표**: 라우터, 컨트롤러, 서비스 계층을 수정하여 레포지토리의 `findPagedWithValidation` 메소드까지 모든 필터/정렬 파라미터를 전달해야 합니다.

**1. `backend/src/schemas/maruSchema.js` 수정**
   - `listQuerySchema`를 상세 설계 문서와 일치하도록 확장합니다.

   ```javascript
   // 수정 제안: backend/src/schemas/maruSchema.js
   const listQuerySchema = Joi.object({
     page: Joi.number().integer().min(1).default(1),
     limit: Joi.number().integer().min(1).max(100).default(20),
     status: Joi.string().valid('CREATED', 'INUSE', 'DEPRECATED', 'ALL').default('ALL'),
     type: Joi.string().valid('CODE', 'RULE', 'ALL').default('ALL'),
     priority: Joi.string().valid('Y', 'N', 'ALL').default('ALL'),
     search: Joi.string().max(200).allow('', null),
     fromDate: Joi.date().iso().optional(),
     toDate: Joi.date().iso().min(Joi.ref('fromDate')).optional(),
     validation: Joi.string().valid('MISSING_CATEGORY', 'MISSING_CODE', 'NO_ACTIVE_VERSION', 'ALL').default('ALL'),
     sort: Joi.string().valid('LATEST', 'NAME_ASC', 'STATUS', 'PRIORITY').default('LATEST')
   });
   ```

**2. `backend/src/routes/maruHeaders.js` 확인**
   - `GET /` 라우터가 수정된 `listQuerySchema`를 사용하는지 확인합니다. (별도 수정 필요 없을 가능성 높음)

**3. `backend/src/controllers/MaruHeaderController.js` 수정 (가상 코드)**
   - `list` 메소드가 `req.query`의 모든 파라미터를 서비스 계층으로 전달하도록 수정합니다.

   ```javascript
   // 수정 제안: backend/src/controllers/MaruHeaderController.js
   async list(req, res, next) {
       try {
           // req.query에는 Joi로 검증되고 기본값이 채워진 모든 파라미터가 포함됨
           const options = req.query;
           const result = await this.service.getPagedList(options); // 서비스의 새 메소드 호출
           // ... 응답 처리
       } catch (error) {
           next(error);
       }
   }
   ```

**4. `backend/src/services/MaruHeaderService.js` 수정 (가상 코드)**
   - `findPagedWithValidation`과 `getValidationFlags`를 호출하여 비즈니스 로직을 완성합니다.

   ```javascript
   // 수정 제안: backend/src/services/MaruHeaderService.js
   async getPagedList(options) {
       // 1. Repository에서 필터링된 목록과 전체 개수를 가져옵니다.
       const { rows, totalCount } = await this.repository.findPagedWithValidation(options);

       if (rows.length === 0) {
           return { data: [], totalCount: 0 };
       }

       // 2. 조회된 ID 목록으로 검증 플래그를 가져옵니다.
       const maruIds = rows.map(row => row.maruId);
       const validationFlags = await this.repository.getValidationFlags(maruIds);

       // 3. 결과에 검증 플래그를 추가(enrich)합니다.
       const enrichedRows = rows.map(row => ({
           ...row,
           validationFlag: validationFlags[row.maruId] || 'UNKNOWN'
       }));
       
       // 4. 최종 결과를 반환합니다.
       return { data: enrichedRows, totalCount };
   }
   ```

### 4.2. ISSUE-002 & 003 해결 방안 (P3, P4)
- **ISSUE-002**: `Task-4-1...상세설계.md` 문서의 API 명세 섹션에 `DELETE /api/v1/maru-overview/cache` API를 추가하여 문서와 구현을 일치시킵니다.
- **ISSUE-003**: 팀과 협의하여 네이밍 컨벤션을 정하고, 다음 리팩토링 주기나 관련 파일 수정 시 이름을 변경하는 것을 권장합니다. (예: `MaruHeaderRepository` -> `MaruHeadRepository`)

---

## 5. 우선순위별 실행 계획

1.  **P1 (즉시 해결)**:
    - `maruSchema.js`의 `listQuerySchema`를 즉시 수정합니다.
    - `MaruHeaderController.js`와 `MaruHeaderService.js`에 위 제안된 로직을 적용하여 API 파라미터가 DB 쿼리까지 전달되도록 수정합니다.
    - 수정 후, Postman이나 통합 테스트를 통해 필터와 정렬 기능이 정상 동작하는지 반드시 검증합니다.

2.  **P3 (차기 해결)**:
    - 다음 문서 업데이트 시점에 캐시 클리어 API 명세를 상세 설계 문서에 추가합니다.

3.  **P4 (개선 과제)**:
    - 코드 리뷰나 리팩토링 회의에서 네이밍 컨벤션 통일 안건을 논의하고, 장기적으로 일관성을 확보해 나갑니다.

---
