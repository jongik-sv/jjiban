# Task 4.2 MR0200 Frontend UI 구현 - Cross Check (gpt-5, 2025-09-26)

## 1. 교차 검증 개요
- **대상 Task**: 4.2 MR0200 Frontend UI 구현
- **참조 문서**  
  - `docs/project/maru/10.design/12.detail-design/Task-4-2.MR0200-Frontend-UI-구현(상세설계).md`  
  - `docs/project/maru/20.implementation/Task-4-2.MR0200-Frontend-UI-구현(implementation).md`  
  - 구현 소스 `nexacro/MR/MR0200.xfdl`, 공통 프레임 `nexacro/FrameBase/Form_Tab.xfdl`
- **검증 범위**: 필터/거래 처리, 요약 위젯, 트렌드 차트, 상태 강조 UI, 설계 ↔ 구현 ↔ 구현 보고서 일치성
- **결론 요약**: P1 3건, P2 1건. 핵심 API 호출이 요청 형식 오류로 동작하지 못하며, 설계·구현 문서가 모두 구현되었다고 주장하지만 트렌드/메타 UI가 통째로 누락되어 기능 요구를 충족하지 못함.

## 2. 주요 발견 사항

### P1-1. 리스트 API 쿼리 문자열 오류로 필터가 서버에 전달되지 않음
- **증상**: `fn_buildQueryString`이 파라미터를 공백으로 이어 붙여 `"page=1 limit=20 status=INUSE"` 형태를 만든다. 브라우저 전송 시 전체가 `page` 파라미터의 값으로 인코딩돼 백엔드는 `limit`, `status`를 받지 못한다.
- **근거**: `nexacro/MR/MR0200.xfdl:434-443`, `796` (`params.join(" ")`)
- **영향**: 필터 기능 및 페이징이 실패 → [REQ-MR0200-UI-001] 위반. 실사용 불가 수준(P1).
- **개선 제안**: `'&'`로 조합하고 각 값에 `encodeURIComponent` 적용. 서버 로그 기반 단위 테스트 추가.

### P1-2. 요약 API 호출 문자열도 공백 연결로 잘못 구성
- **증상**: `fn_searchSummary`에서 `"type=" + type + " status=" + status ...` 로 작성. 서버는 `type`만 받고 나머지는 값으로 합쳐져 요약 카드가 항상 MISS/0으로 남는다.
- **근거**: `nexacro/MR/MR0200.xfdl:449-467`
- **영향**: [REQ-MR0200-UI-002] (요약 카드) 충족 불가. 리스트와 동일하게 P1.
- **개선 제안**: 동일한 QueryString 빌더를 재사용하고, Summary Transaction OutDataset 검증.

### P1-3. 설계에 명시된 트렌드 차트/메타 UI 전체 누락
- **설계 요구**: `dsTrend`, `dsSummaryMeta(LAST_UPDATED, CACHE_STATUS)`, `cht_statusTrend`, `sta_cacheBadge`를 통해 기간별 추이와 캐시 상태를 시각화. (상세설계 178~219행, 215~219행, 257행)
- **구현 현황**: `nexacro/MR/MR0200.xfdl`에 해당 Dataset·컴포넌트·콜백이 존재하지 않음. 요약 카드만 구현됨.
- **구현 보고서 모순**: `Task-4-2...implementation.md`는 "11개 Dataset 100% 구성", "트렌드 차트 구현"이라 명시(표 1.3, 2.2, 5.2, 8.3)하지만 실제 코드에는 없음.
- **영향**: [REQ-MR0200-UI-002], [REQ-MR0200-UI-004] 미충족. 경영 KPI 모니터링 불가 → P1.
- **개선 제안**: 설계서에 따라 Chart 컨테이너·Dataset·Transaction을 복원하고, Summary API가 Trend/Meta 데이터를 반환하도록 수정. 구현 보고서도 정정 필요.

### P2-1. 누락 상태 강조 배지 미구현
- **설계 요구**: `HAS_CATEGORY` 등 누락 플래그에 따라 그리드에서 `MISSING_CATEGORY/MISSING_CODE/NO_ACTIVE_VERSION` 배지 표시.(상세설계 193~197행, REQ-MR0200-UI-003)
- **구현**: Grid 컬럼 정의(`nexacro/MR/MR0200.xfdl:234-244`, `144-173`)에는 `HAS_CATEGORY`가 있으나 렌더링 로직이 없어 배지가 나타나지 않음.
- **영향**: 중요 경고가 시각적으로 전달되지 않아 운영 위험 → P2.
- **개선 제안**: 표현용 Static/Mask/Tooltip 추가, `fnRenderBadge` 유틸(상세설계 257행)을 연결.

## 3. 부가 관찰 및 권장 사항
- **문서 불일치**: 구현 보고서는 UI/데이터셋/트렌드 기능이 모두 완료되었다고 기록하므로 즉시 정정해야 함. 참고자들이 완성된 기능으로 오해할 위험.
- **Playwright 스펙 한계**: E2E 테스트가 URL 포함 문자열만 확인해 QueryString 오류를 잡지 못함. API 응답 검증, 서버단 파라미터 로깅 기반 테스팅을 보강 필요.
- **캐시 상태 UI**: 설계서는 Badge(`sta_cacheBadge`)로 HIT/MISS를 표시하고 10분 경과 시 색상을 바꾸도록 요구하지만 현재는 텍스트만 존재. 트렌드 복원 시 함께 구현 권장.

## 4. 추천 후속 조치
1. `fn_buildQueryString`, `fn_searchSummary` 수정 및 단위 테스트 추가(REST GET 파라미터 검증).
2. Summary Transaction을 다중 OutDataset 구조로 확장하고, 트렌드 차트·메타 UI를 설계대로 구현. 구현 보고서도 갱신.
3. Grid 누락 배지/Tooltip 로직을 구현하고 스타일 가이드를 적용.
4. 수정 후 Playwright 4개 주요 시나리오(TC-MR0200-UI-001~004)와 통합 테스트를 재실행. 서버 로그/응답값까지 검증하도록 스펙 개선.

---
**교차 검증 상태**: 심각한 불일치(P1) 발견. Task 4.2는 "완료"로 보기 어려우며, 위 수정이 완료되기 전에는 배포를 보류해야 함.
