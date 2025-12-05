# Task 4.2 MR0200 Frontend UI 구현 - 교차 검증(Cross Check) 보고서

**문서 ID**: `Task-4-2.MR0200-Frontend-UI-구현(crosscheck)_gemini_20251001.md`
**검증일**: 2025-10-01
**검증자**: Gemini (system-architect, quality-engineer, security-engineer)
**대상**: Task 4.2 MR0200 Frontend UI 구현

---

## 1. 교차 검증 개요

### 1.1 검증 목적
본 문서는 Task 4.2의 산출물(상세설계, 구현 보고서, 소스코드, E2E 테스트 결과) 간의 정합성을 교차 검증하여 불일치성을 식별하고, 코드 품질 및 잠재적 리스크를 분석하여 개선 방안을 제시하는 것을 목적으로 합니다.

### 1.2 검증 범위
- **상세설계서**: `Task-4-2.MR0200-Frontend-UI-구현(상세설계).md`
- **구현보고서**: `Task-4-2.MR0200-Frontend-UI-구현(implementation).md`
- **소스코드**: `nexacro/MR/MR0200.xfdl`
- **E2E 테스트 보고서**: `Task-4-2-MR0200-E2E-Test-Report.md`

### 1.3 검증 요약
| 심각도 | 건수 | 주요 내용 |
| :--- | :--- | :--- |
| ⚠️ **Critical (P1)** | 1 | 기간 변경 시 무한 재귀 호출로 인한 앱 충돌 |
| ❗ **High (P2)** | 2 | 사용자 지정 날짜 컨트롤 미표시, 잘못된 API 파라미터 전송 |
| 🔧 **Medium (P3)** | 2 | 핵심 기능(트렌드 차트) 누락, 하드코딩된 API 주소 |
| 📝 **Low (P4)** | 1 | 접근성 요구사항 미검증 |
| **총계** | **6** | |

**종합 평가**: E2E 테스트에서 88.9%의 높은 통과율을 보였으나, 앱을 다운시킬 수 있는 **치명적인(Critical) 결함이 발견**되어 즉각적인 수정 없이는 배포가 불가능합니다.

---

## 2. 상세 검증 결과 및 개선 제안

### ⚠️ Critical (P1)

#### 이슈 1: 기간 변경 시 무한 재귀 호출로 인한 애플리케이션 충돌
- **심각도**: Critical
- **우선순위**: P1 (즉시 해결)
- **현상**: '기간' 콤보박스 값을 변경하면 `cbo_period_onitemchanged` 함수가 자기 자신을 계속 호출하여 스택 오버플로우(Stack Overflow)를 유발하고 애플리케이션이 멈추거나 충돌합니다.
- **근본 원인**: `cbo_period_onitemchanged` 함수 내에서 `this.cbo_filter_onitemchanged(obj, e);`를 호출하고, 이 함수가 다시 `cbo_period_onitemchanged`를 트리거하는 구조로 되어 있습니다.
- **소스코드 위치**: `MR0200.xfdl`의 `<Script>` 섹션, `cbo_period_onitemchanged` 함수 마지막 줄

- **개선 제안**:
  `cbo_period_onitemchanged` 함수 마지막의 재귀적 호출을 제거하고, 필터 변경 공통 함수 `cbo_filter_onitemchanged`를 직접 호출하도록 수정해야 합니다.

  ```javascript
  // AS-IS (오류)
  this.cbo_period_onitemchanged = function(obj, e)
  {
      // ... (코드 생략) ...

      // 조회 실행 (문제의 재귀 호출)
      this.cbo_filter_onitemchanged(obj, e);
  };

  // TO-BE (수정안)
  this.cbo_period_onitemchanged = function(obj, e)
  {
      trace("cbo_period_onitemchanged: " + e.postvalue);
      var period = e.postvalue;

      if (period == "CUSTOM") {
          this.div_search.form.sta_fromDate.set_visible(true);
          this.div_search.form.cal_fromDate.set_visible(true);
          this.div_search.form.sta_toDate.set_visible(true);
          this.div_search.form.cal_toDate.set_visible(true);
          // ...
      } else {
          this.div_search.form.sta_fromDate.set_visible(false);
          this.div_search.form.cal_fromDate.set_visible(false);
          this.div_search.form.sta_toDate.set_visible(false);
          this.div_search.form.cal_toDate.set_visible(false);
          // ...
      }

      // 올바른 조회 함수 호출
      this.fn_applyFiltersAndSearch();
  };

  // 공통 필터 적용 및 검색을 위한 새 함수 생성
  this.fn_applyFiltersAndSearch = function()
  {
      if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
      }

      var self = this;
      this.debounceTimer = setTimeout(function() {
          self.fn_searchList();
          self.fn_searchSummary();
      }, 300);
  }

  // 기존 cbo_filter_onitemchanged는 새 함수를 호출하도록 변경
  this.cbo_filter_onitemchanged = function(obj, e)
  {
      trace("cbo_filter_onitemchanged: " + obj.id);
      this.fn_applyFiltersAndSearch();
  };
  ```

---

### ❗ High (P2)

#### 이슈 2: 사용자 지정 기간 선택 시 날짜 컨트롤 미표시
- **심각도**: High
- **우선순위**: P2 (빠른 해결)
- **현상**: E2E 테스트(TC-MR0200-UI-005)에서 확인된 바와 같이, 기간을 '사용자 지정'으로 선택해도 날짜(Calendar) 컴포넌트가 화면에 표시되지 않아 날짜를 입력할 수 없습니다.
- **근본 원인**: 상기 **Critical 이슈 1**의 무한 재귀로 인해 UI 갱신 로직이 정상적으로 완료되지 못하기 때문입니다.
- **개선 제안**: Critical 이슈 1을 해결하면 본 문제는 자동으로 해결됩니다.

#### 이슈 3: 잘못된 API 파라미터 구분자 사용
- **심각도**: High
- **우선순위**: P2 (빠른 해결)
- **현상**: API 요청 시 URL 파라미터를 `&`가 아닌 공백(` `)으로 구분하여 전송하고 있습니다. 이는 비표준 방식으로, 서버 환경에 따라 요청이 실패할 수 있는 잠재적 위험 요소입니다.
- **소스코드 위치**: `MR0200.xfdl`, `fn_buildQueryString` 함수

- **개선 제안**:
  `params.join(" ")`을 표준인 `params.join("&")`으로 수정해야 합니다.

  ```javascript
  // AS-IS (오류)
  this.fn_buildQueryString = function()
  {
      // ...
      return params.join(" ");
  };

  // TO-BE (수정안)
  this.fn_buildQueryGfnTransactionueryString = function()
  {
      // ...
      return params.join("&");
  };
  ```

---

### 🔧 Medium (P3)

#### 이슈 4: 핵심 기능(트렌드 차트) 누락
- **심각도**: Medium
- **우선순위**: P3 (보통 해결)
- **현상**: 상세설계서의 요구사항 `[REQ-MR0200-UI-004]`에 명시된 '트렌드 차트' 기능이 구현에서 제외되었습니다. 이는 설계와 구현 간의 명백한 불일치입니다.
- **근본 원인**: 구현 보고서에 "향후 확장"으로 명시되어 있으나, 이 결정이 설계 변경 관리 프로세스를 따랐는지 불분명합니다.
- **개선 제안**:
  1.  **단기**: 상세설계서의 해당 요구사항을 '보류(On Hold)' 상태로 업데이트하고, 제외 사유를 명시하여 문서 간의 일관성을 확보해야 합니다.
  2.  **장기**: 후속 Task로 트렌드 차트 구현을 계획하고 `tasks.md`에 등록해야 합니다.

#### 이슈 5: 하드코딩된 API URL
- **심각도**: Medium
- **우선순위**: P3 (보통 해결)
- **현상**: API 요청 URL(`http://localhost:3000/...`)이 소스코드에 하드코딩되어 있습니다. 이는 개발, 테스트, 운영 환경 간 전환을 어렵게 하고 유지보수성을 저해합니다.
- **소스코드 위치**: `MR0200.xfdl`, `fn_searchList`, `fn_searchSummary` 함수
- **개선 제안**:
  Nexacro의 전역 변수나 `environment.xml`에 API 기본 URL을 설정하고, 스크립트에서는 이를 참조하도록 변경해야 합니다.

  ```javascript
  // 예: Application Variables에 gv_apiUrl = "http://localhost:3000" 설정

  // TO-BE (수정안)
  var sUrl = nexacro.getApplication().gv_apiUrl + "/api/v1/maru-headers";
  this.transaction("TX_MR0200_LIST", sUrl, ...);
  ```

---

### 📝 Low (P4)

#### 이슈 6: 접근성 요구사항 미검증
- **심각도**: Low
- **우선순위**: P4 (개선 항목)
- **현상**: 상세설계서의 비기능 요구사항 `[REQ-MR0200-NFR-UI-002]`(접근성)에 대한 검증이 누락되었습니다.
- **근본 원인**: 구현 보고서에 '미검증'으로 명시되어 있습니다.
- **개선 제안**:
  - 후속 QA 단계에서 스크린리더 테스트, 키보드 네비게이션 시나리오 검증을 포함해야 합니다.
  - `axe-core`와 같은 자동화된 접근성 테스트 도구를 Playwright 테스트에 통합하는 것을 고려할 수 있습니다.

---

## 3. 최종 결론 및 권장 사항

**최종 결론**
Task 4.2는 외형적으로 높은 완성도를 보이나, **앱을 중단시키는 치명적인 결함(P1)**을 내포하고 있어 현재 상태로는 **배포 절대 불가**입니다. E2E 테스트가 시나리오 기반으로 동작하여 로직 내부의 심각한 오류(무한 재귀)를 발견하지 못한 점은 향후 테스트 전략 보완이 필요함을 시사합니다.

**권장 사항**
1.  **즉시 조치**: P1, P2 이슈를 최우선으로 해결하고, 수정 사항에 대한 단위 및 회귀 테스트를 반드시 수행해야 합니다.
2.  **문서 업데이트**: P3 이슈(차트 누락)에 대해 상세설계 문서를 현재 구현 상태에 맞게 업데이트하여 버전 불일치를 해소해야 합니다.
3.  **프로세스 개선**: E2E 테스트 외에, 동료 검토(Peer Review)나 정적 코드 분석을 도입하여 로직 레벨의 오류를 조기에 발견하는 체계를 마련할 것을 권장합니다.

**배포 준비도 평가**: ⛔ **배포 불가 (Needs Urgent Fix)**
