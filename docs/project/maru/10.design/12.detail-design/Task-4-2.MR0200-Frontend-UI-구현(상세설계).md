# MARU 상세설계 – Task 4.2 MR0200 Frontend UI 구현

**Template Version:** 1.2.0  **Last Updated:** 2025-09-26  **Status:** Draft

---

## 0. 문서 메타데이터

- **문서명:** `Task 4.2 MR0200 Frontend UI 구현(상세설계).md`
- **버전/작성:** v0.9 / 2025-09-26 / Codex (architect + scribe)
- **참조 문서:**
  - `docs/project/maru/00.foundation/01.project-charter/tasks.md`
  - `docs/project/maru/00.foundation/02.design-baseline/4. ui-design.md`
  - `docs/project/maru/00.foundation/02.design-baseline/5. program-list.md`
  - `docs/project/maru/10.design/12.detail-design/Task-4-1.MR0200-Backend-API-구현(상세설계).md`
  - `backend/test-results/Task-4-1-Integration-Test-Report.md`
- **위치:** `docs/project/maru/10.design/12.detail-design/`
- **관련 티켓:** Task 4.2 MR0200 Frontend UI 구현
- **요구사항 출처:** BRD UC-001, UC-006 / TRD UI 가이드 / BE 상세설계 REQ-MR0200-API-###
- **추적 담당:** PMO-UX / 품질 추적: Traceability CSV(작성 예정)

---

## 1. 목적 및 범위

- **목적:** Nexacro N v24 기반 `frmMR0200.xfdl` 화면을 통해 마루 현황을 리스트·차트·통계 카드로 가시화하고 Backend 확장 API(MH001, maru-overview summary)와 완전 연동한다.
- **범위 (포함):**
  - 검색/필터 패널, 그리드, 요약 카드, 현황 차트 UI 및 데이터 바인딩
  - Dataset 설계, Transaction 흐름, Validation/Exception 처리
  - 캐시 HIT/MISS 표시, 검증 경고 배지 등 시각 피드백
  - UI 수준 성능·보안·테스트 전략
- **범위 (제외):**
  - Backend API 로직 변경 (Task 4.1 참조)
  - 공통 메뉴 프레임 · 전역 레이아웃 (기존 FrameBase 재사용)
  - 코드/룰 상세 모달, Export 등 후속 기능

---

## 2. 요구사항 & 승인 기준

- **기능 요구사항**
  1. **[REQ-MR0200-UI-001]** 마루 목록 그리드는 페이지네이션, 정렬, 다중 필터(status/type/priority/validation/search/date)를 지원해야 한다.
  2. **[REQ-MR0200-UI-002]** 현황 요약 카드는 상태/타입별 건수를 표시하고 서버 캐시 HIT/MISS 여부를 시각화해야 한다.
  3. **[REQ-MR0200-UI-003]** 검증 조건(MISSING_CATEGORY, MISSING_CODE, NO_ACTIVE_VERSION)과 우선사용 여부를 그리드 행에 배지로 표시한다.
  4. **[REQ-MR0200-UI-004]** 기간 선택(오늘/7일/30일/사용자 지정)에 따라 트렌드 차트(Nexacro Chart)와 리스트가 동기 갱신되어야 한다.
  5. **[REQ-MR0200-UI-005]** 조회 실패/데이터 없음/Validation 실패 시 표준화된 Nexacro 알림과 ErrorCode 기반 메시지를 노출한다.
- **비기능 요구사항**
  - **[REQ-MR0200-NFR-UI-001]** 초기 로딩 2초 이내, 필터 재조회 1초 이내(Back-end NFR과 정합)
  - **[REQ-MR0200-NFR-UI-002]** 접근성: 키보드 탐색, 스크린리더 Label 설정, 색 대비 4.5:1 이상
  - **[REQ-MR0200-NFR-UI-003]** 일관된 UI 패턴 유지 (MR0100과 동일한 공통 컴포넌트 사용)
- **승인 기준**
  - 위 기능 요구사항 100% 충족
  - QA 시나리오(§12) 전부 통과
  - Backend 통합 테스트 보고서와 UI 동작 일치 확인
  - UX 리뷰에서 사용성 B등급 이상 확보

### 2-1. 요구사항-설계 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 설계 섹션 | 테스트 케이스 ID | 상태 | 비고 |
|-------------|---------------|-----------|-------------------|------|------|
| REQ-MR0200-UI-001 | 필터+그리드 조회 | §5, §6.1, §8.1 | TC-MR0200-UI-001 | 초안 | 페이징/정렬 포함 |
| REQ-MR0200-UI-002 | 현황 카드 | §5, §6.1 | TC-MR0200-UI-002 | 초안 | 캐시 표시 |
| REQ-MR0200-UI-003 | 검증 배지 | §6.1 | TC-MR0200-UI-003 | 초안 | 경고 Tooltip |
| REQ-MR0200-UI-004 | 기간-트렌드 연동 | §5, §8.1 | TC-MR0200-UI-004 | 초안 | 차트 재렌더 |
| REQ-MR0200-UI-005 | 오류 처리 | §9, §10 | TC-MR0200-UI-005 | 초안 | ErrorCode 매핑 |
| REQ-MR0200-NFR-UI-001 | 응답시간 | §11 | TC-MR0200-UI-006 | 초안 | 로딩 인디케이터 |
| REQ-MR0200-NFR-UI-002 | 접근성 | §6.3, §10 | TC-MR0200-UI-007 | 초안 | 키보드 시나리오 |
| REQ-MR0200-NFR-UI-003 | UI 일관성 | §6, §8 | TC-MR0200-UI-008 | 초안 | 공통 컴포넌트 |

---

## 3. 용어/가정/제약

- **용어 정의**
  - **MR0200:** 마루 현황 조회 화면
  - **Validation Flag:** Backend 검증 상태 코드(OK/WARN/ERROR)
  - **캐시 스탬프:** Backend summary API에서 반환하는 `CACHE_STATUS`
- **가정**
  - Backend Task 4.1 API가 배포·안정
  - 공통 Frame, gfn* 유틸 스크립트 사용 가능
  - Nexacro Chart/Combo 컴포넌트 라이선스 적용
- **제약**
  - Nexacro N v24 런타임만 사용
  - Dataset 기반 데이터 바인딩 준수
  - 모바일 대응은 PoC 범위에서 제외 (Desktop ≥ 1280px)

---

## 4. 화면 모듈 개요

- **책임:** `frmMR0200.xfdl`, `MR0200.xjs`
- **연계:** Backend `GET /api/v1/maru-headers`, `GET /api/v1/maru-overview/summary`
- **주요 Dataset:**
  - `dsFilter` (검색 조건 유지)
  - `dsMaruList` (그리드)
  - `dsPagination`
  - `dsStatusSummary`
  - `dsTrend`
  - `dsValidationOptions`, `dsStatusOptions`, `dsTypeOptions`
- **재사용 스크립트:** `gfnTransaction`, `gfnBindCombo`, `gfnDatasetClear`, `gfnShowToast`

---

## 5. 프로세스 흐름

1. **[REQ-MR0200-UI-001/002]** 화면 로드 → 기본 필터 세팅 → 리스트 & 요약 동시 조회
2. **[REQ-MR0200-UI-001/004]** 사용자가 필터(상태/타입/기간) 변경 → 유효성 검사 → 재조회
3. **[REQ-MR0200-UI-002]** Summary API 응답 → 카드 데이터 반영 → 캐시 HIT 뱃지 업데이트
4. **[REQ-MR0200-UI-003]** 리스트 행 렌더링 → Validation Flag에 따라 배지/Tooltip 표시
5. **[REQ-MR0200-UI-005]** API ErrorCode 처리 → 알림, Retry, 빈 상태 표시

### 5-1. 프로세스 개념(Flowchart)

```mermaid
flowchart TD
  A[폼 onload] --> B[기본 Dataset 초기화]
  B --> C{필수 조건 유효?}
  C -- 예 --> D[Transaction TX_MR0200_LIST 호출]
  D --> E[dsMaruList/ dsPagination 바인딩]
  E --> F[그리드/배지 렌더링]

  C -- 아니오 --> Z[Validation Alert 표시]

  A --> G[TX_MR0200_SUMMARY 호출]
  G --> H[dsStatusSummary/ dsTrend 바인딩]
  H --> I[카드/차트 렌더링]
  I --> J{CACHE_STATUS == HIT?}
  J -- 예 --> K[HIT 표시 (녹색 뱃지)]
  J -- 아니오 --> L[MISS 표시 (회색/아이콘)]

  E --> M{검색, 정렬, 기간 변경}
  M --> N[필터 Dataset 갱신]
  N --> D
```

---

## 6. UI 설계

```
┌──────────────────────────────────────────────────────────────┐
│ Title: MARU 현황 조회 (MR0200)                               │
├──────────────────────────────────────────────────────────────┤
│ Search Panel                                                  │
│ [마루유형 ▼] [상태 ▼] [우선사용 ▼] [검증조건 ▼] [기간 ▼]     │
│ [검색어 입력.............................] [조회] [초기화]    │
├──────────────────────────────────────────────────────────────┤
│ Summary Cards (Grid 4열)                                      │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                            │
│ │전체  │ │사용중│ │검증경│ │캐시  │                            │
│ │123 ea│ │87 ea │ │12 ea │ │HIT   │                            │
│ └──────┘ └──────┘ └──────┘ └──────┘                            │
├──────────────────────────────────────────────────────────────┤
│ Trend Chart (Line/Column)                                     │
│ [기간 선택: Today / 7일 / 30일 / Custom]                      │
│ ──────────────────────────────────────────────────────────── │
│ │                        Chart Area                        │ │
│ ──────────────────────────────────────────────────────────── │
├──────────────────────────────────────────────────────────────┤
│ List Grid                                                     │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ ID │ 마루명 │ 유형 │ 상태 │ 최신버전 │ 우선사용 │ 검증 │…│ │
│ │ …  │ …     │ CODE │ WARN │ v2       │ Y       │ ⚠️   │ │
│ └───────────────────────────────────────────────────────────┘ │
│ [이전] 1 2 3 ... [다음]   총 345건                             │
├──────────────────────────────────────────────────────────────┤
│ Status Bar: Error/Loading 메시지, Processing Indicator        │
└──────────────────────────────────────────────────────────────┘
```

- 정렬 기준/검색 버튼 단축키: Alt+S / Alt+C
- 캐시 카드: HIT(녹색), MISS(회색), Tooltip “서버 캐시 갱신: yyyy-MM-dd HH:mm:ss”
- 검증 배지: OK(초록), WARN(주황), ERROR(빨강), Tooltip에 상세 사유 표시

### 6-2. UI 개념 SVG

- `docs/project/maru/10.design/12.detail-design/ui-assets/Task-4-2.MR0200-Layout.svg` (초안)
- 구성: Summaries(4카드), LineColumnChart, Grid, FilterBar
- 컴포넌트 명시: `comp_filterForm`, `grd_maruList`, `cht_statusTrend`, `sta_cacheBadge`

### 6-3. 반응형/접근성 가이드

- 해상도 ≥1280px: Summary 4열, 차트/그리드 좌우 배치 유지
- 1024~1279px: Summary 2x2 Grid, 차트/그리드 세로 스택
- 키보드 포커스 순서: 필터 → 조회 → Summary → 차트 → 그리드 → 페이지네이션
- 스크린리더: 카드에 `value + label` 읽기, 배지 Tooltip은 `aria-describedby` 매핑

---

## 7. 데이터 메시지 구조

- **입력 Dataset**
  - `dsFilter`: TYPE, STATUS, PRIORITY, VALIDATION, PERIOD, SEARCH_TEXT, FROM_DATE, TO_DATE, SORT
- **출력 Dataset**
  - `dsMaruList`: MARU_ID, MARU_NAME, MARU_TYPE, MARU_STATUS, VERSION, PRIORITY, HAS_CATEGORY, VALIDATION_FLAG, UPDATED_AT, OWNER
  - `dsPagination`: PAGE, TOTAL_COUNT, PAGE_SIZE, PAGE_COUNT
  - `dsStatusSummary`: LABEL, COUNT, STATUS_COLOR, CACHE_STATUS
  - `dsTrend`: PERIOD_LABEL, CREATED_COUNT, UPDATED_COUNT, WARN_COUNT
- **메시지 전달**
  - `ErrorCode`, `ErrorMsg`, `SuccessRowCount`는 공통 Dataset 헤더로 수신
  - Error 시 `dsError`로 세부 필드 반환 (옵션)

---

## 8. 인터페이스/Contract

- **TX_MR0200_LIST (gfnTransaction)**
  - URL: `/api/v1/maru-headers`
  - Input: `in_ds=dsFilter:U`
  - Output: `out_ds=dsMaruList=dataset, dsPagination=dataset`
  - 성공 처리: 그리드·페이지 갱신, 로딩 인디케이터 종료
  - 실패 처리: `ErrorCode` 분기 → -400 Validation toast, -100 Business modal, -1 Empty state
- **TX_MR0200_SUMMARY**
  - URL: `/api/v1/maru-overview/summary`
  - Input: `dsFilter` 중 TYPE/STATUS/PERIOD
  - Output: `dsStatusSummary`, `dsTrend`, `dsSummaryMeta`(CACHE_STATUS, LAST_UPDATED)
  - 캐시 처리: MISS일 때 `sta_cacheBadge` 강조, 10분 후 자동 재조회 타이머
- **이벤트 연계**
  - Filter Combo `onitemchanged` → debounce(300ms) → TX 호출
  - Chart `onclicklegend` → 해당 상태 필터 토글 후 재조회

---

## 9. 오류/예외/경계조건

- 필터 미입력: 기간 Custom 선택 시 시작/종료 필수, 미입력시 경고
- 데이터 없음: 그리드 EmptyRow “조건에 맞는 마루가 없습니다.” 표시
- 서버 오류: ErrorCode=-200 → Retry 버튼, Summary/Chart 회색 처리
- 캐시 미지원 응답: `CACHE_STATUS` 미존재 시 기본값 MISS, 뱃지 숨김
- Chart 데이터 누락: count==0일 때 “데이터 없음” 라벨

---

## 10. 보안/품질 고려

- 입력 검증: 시작일 ≤ 종료일, 검색어 100자 제한, 특수문자 escaping
- 권한: PoC 가정으로 생략(후속 버전 JWT 적용 예정)
- 로깅: Transaction 완료 시 `gfnAppendStatusLog`
- 접근성: Combo/버튼 ARIA, 배지 alt text, 차트 dataset `set_accessibility(true)`

---

## 11. 성능/최적화 전략

- API 응답 SLA 연계 (목표 1초 이내), 로딩 시 Skeleton 표시
- 그리드 Lazy-rendering: 200행 이상에서 가상 스크롤 적용
- Summary/Chart API 병렬 호출
- 필터 변경 Debounce 300ms
- 캐시 MISS 시만 차트 재조회( HIT면 로컬 Dataset 재사용 옵션 )

---

## 12. 테스트 전략

- **단위 테스트 (Nexacro Script)**
  - `gfnSetFilterCondition` 값 검증
  - `fnRenderBadge` 색상·Tooltip 로직 검증
- **통합 테스트 (Headless Nexacro/Playwright)**
  - TC-MR0200-UI-001: 기본 조회 + 페이징
  - TC-MR0200-UI-002: 캐시 HIT/MISS 표시
  - TC-MR0200-UI-003: Validation 배지/Tooltip
  - TC-MR0200-UI-004: 기간 변경 → 차트/리스트 동기
  - TC-MR0200-UI-005: ErrorCode 별 메시지 처리
  - TC-MR0200-UI-007: 키보드 탐색/포커스
- **성능 측정**
  - Nexacro 프로파일러로 로딩 시간 측정
  - 로컬 자동화 스크립트로 100회 조회 평균치 확보

---

## 13. 리스크 & 완화

| 리스크 | 영향 | 가능성 | 완화 전략 |
|--------|------|--------|-----------|
| Backend 응답 필드 변경 | UI 오류 | 중 | 계약 명세 공유, 공통 Mapper 적용 |
| 차트 성능 저하 | UX 저하 | 중 | 데이터 50포인트 제한, 샘플링 |
| Debounce 누락 | 트래픽 증가 | 중 | 공통 함수 적용 |
| 검증 배지 색상 혼동 | 접근성 저하 | 낮 | UX 리뷰, WCAG 기준 준수 |

---

## 14. 변경 이력

| 버전 | 일자 | 작성자 | 주요 내용 |
|------|------|--------|-----------|
| v0.9 | 2025-09-26 | Codex | 초안 작성 (요구사항·UI·데이터·테스트 포함) |

---

## 15. 기존 개념과의 비교

- MR0100 대비 CRUD 대신 조회/분석 중심, Summary/Chart 추가로 정보량 확장
- Backend Task 4.1 확장 필드(HAS_CATEGORY 등)를 UI에 반영하여 데이터 품질 경고 제공
- 캐시 시각화로 운영 지표 강조, 운영자 대응 속도 향상 기대

---

## 16. 구현 준비 체크

- [ ] Dataset/Transaction ID 확정 (`TX_MR0200_LIST`, `TX_MR0200_SUMMARY`)
- [ ] UI 자산(SVG, 색상 정의) 확정
- [ ] gfn 공통 스크립트 의존성 검토
- [ ] 테스트 스텁/Mock 데이터 준비
- [ ] Traceability CSV 업데이트 예정

---

## 부록 A. 후속 제안

1. Nexacro Form 골격 생성 및 Dataset/컴포넌트 배치 (`frmMR0200.xfdl`).
2. gfnTransaction 매핑 및 필터 이벤트 스크립트 구현.
3. Playwright UI 자동화 초안 작성(검색/필터/차트 검증).
