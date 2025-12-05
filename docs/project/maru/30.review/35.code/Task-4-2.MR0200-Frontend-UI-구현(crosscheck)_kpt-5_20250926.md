# Task 4.2 MR0200 Frontend UI 구현 - Cross Check (gpt-5, 2025-09-26)

## Cross Check 개요
- **Task**: 4.2 MR0200 Frontend UI 구현
- **참고 문서**: 상세 설계서(`docs/project/maru/10.design/12.detail-design/Task-4-2.MR0200-Frontend-UI-구현(상세설계).md`), 구현 산출물(`nexacro/MR/MR0200.xfdl`), FrameBase 탭 처리(`nexacro/FrameBase/Form_Tab.xfdl`)
- **분석 범위**: 필터/거래 처리, 요약 위젯, 차트/트렌드, 상태 강조 UI, 탭/화면 통합
- **요약**: P1 3건, P2 1건. 리스트/요약 API 호출이 실패 가능한 상태이며, 설계에 포함된 트렌드 차트와 메타 정보가 전혀 구현되지 않았음.

## 주요 발견 사항
### P1 – 리스트 조회 QueryString 조합 오류로 API 호출 실패
- **내용**: `fn_buildQueryString`이 파라미터를 공백으로 연결하여 `page=1 limit=20 status=INUSE` 형태를 생성함. Express에서 단일 키로 파싱되어 `limit`, `status` 값이 전달되지 않아 필수 필터가 무시되거나 400 반환 가능.
- **근거**: `nexacro/MR/MR0200.xfdl:434-443`, `796`
- **영향**: 리스트 조회가 정상 동작하지 않으며 필터링 요구사항([REQ-MR0200-UI-001]) 충족 불가. 즉시 수정 필요.
- **조치 제안**: `join('&')`로 변경하고, 각 값 `encodeURIComponent` 적용.

### P1 – 요약 API 매개변수 결합 오류
- **내용**: `fn_searchSummary`가 ` ` 대신 공백으로 파라미터를 연결(`"type=" + type + " status=" + status ...`). 결과적으로 서버에는 `type` 하나만 전달되고 나머지는 값으로 합쳐짐.
- **근거**: `nexacro/MR/MR0200.xfdl:449-467`
- **영향**: 요약 카드가 항상 기본값(0/MISS)으로 남아 [REQ-MR0200-UI-002] 미충족. 리스트와 동일하게 P1.
- **조치 제안**: `&` 구분자로 변경하고, 필터 데이터셋과 동일한 인코딩 로직 공유.

### P1 – 트렌드 차트/메타 UI 전무 (요구 기능 미구현)
- **내용**: 상세설계는 `LineColumnChart(cht_statusTrend)`, `dsTrend`, `dsSummaryMeta(LAST_UPDATED, CACHE_STATUS)` 를 통해 기간별 추이를 표시하도록 정의. 실제 구현엔 관련 Dataset·컴포넌트·콜백이 존재하지 않고, 요약 카드만 있음.
- **근거**:
  - 설계: `docs/project/maru/10.design/12.detail-design/Task-4-2...md` 178-219행
  - 구현: `nexacro/MR/MR0200.xfdl` 전체에 `cht_statusTrend`, `dsTrend`, `dsSummaryMeta`, `sta_cacheBadge` 없음.
- **영향**: [REQ-MR0200-UI-002], [REQ-MR0200-UI-004] 모두 미충족. 사용자 주요 KPI 시각화 부재로 기능 공백.
- **조치 제안**: 설계서 기반 차트 컨테이너/데이터셋/Transaction 매핑 재구현, 요약 TX에서 trend/meta를 수신하도록 수정.

### P2 – 누락 상태 강조(UI 배지) 미구현
- **내용**: Grid 컬럼에 `HAS_CATEGORY` 가 존재하지만 렌더링 로직이 없어 설계서에서 요구한 `MISSING_CATEGORY/MISSING_CODE` 배지가 표시되지 않음. 현재 `col6`은 Priority, `col7`은 Validation만 처리.
- **근거**: 설계 요구([REQ-MR0200-UI-003]), `nexacro/MR/MR0200.xfdl:234-244`, `144-173`
- **영향**: 비즈니스상 중요하지만 치명적 실패는 아님. 시각적 경고 누락 → P2.
- **조치 제안**: `HAS_CATEGORY` 값에 따라 badge/static/tooltip 추가, 색상/아이콘 가이드 적용.

## 추천 후속 조치
1. `fn_buildQueryString`, `fn_searchSummary`의 쿼리 문자열 구성을 즉시 수정하고 단위 테스트 추가.
2. 트렌드 차트와 요약 메타 Dataset/컴포넌트를 설계대로 재구성하고, Summary Transaction을 다중 OutDataset으로 재정의.
3. Grid에 누락 상태 뱃지/Tooltip 렌더링 로직을 추가하고, 관련 UI 자산(`fnRenderBadge`)을 연결.
4. 수정 후 필터-차트-그리드가 연동되는 통합 시나리오 UI 테스트(Playwright TC-MR0200-UI-001~004) 재실행.
