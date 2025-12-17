# TSK-06-01: 의존관계 그래프 시각화 기능 - 구현 완료

## 구현 개요
- **작업일**: 2025-12-17
- **상태**: 구현 완료 [im]

---

## 1. 구현 파일 목록

### 새로 생성된 파일

| 파일 | 설명 |
|------|------|
| `app/types/graph.ts` | GraphNode, GraphEdge, GraphData 타입 정의 |
| `app/composables/useDependencyGraph.ts` | flatNodes → GraphData 변환, 위상정렬 레벨 계산 |
| `app/components/wbs/graph/DependencyGraph.vue` | vis-network 캔버스 컴포넌트 |
| `app/components/wbs/graph/GraphLegend.vue` | 카테고리 범례 컴포넌트 |
| `app/components/wbs/graph/DependencyGraphModal.vue` | PrimeVue Dialog 전체화면 모달 |

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `app/components/wbs/WbsTreeHeader.vue` | 그래프 버튼 추가, 모달 연동 |
| `package.json` | vis-network ^9.1.9, vis-data ^7.1.9 추가 |

---

## 2. 주요 구현 내용

### 2.1 타입 정의 (app/types/graph.ts)

```typescript
export interface GraphNode {
  id: string
  label: string
  title?: string        // HTML 툴팁
  group: string         // 카테고리 (development/defect/infrastructure)
  level?: number        // 위상정렬 레벨
  color?: { background?: string; border?: string }
  font?: { color?: string; size?: number }
}

export interface GraphEdge {
  id: string
  from: string
  to: string
  arrows: string        // 'to'
  color?: { color?: string; highlight?: string; hover?: string }
}

export const GRAPH_COLORS = {
  development: { background: '#3b82f6', border: '#2563eb' },
  defect: { background: '#ef4444', border: '#dc2626' },
  infrastructure: { background: '#22c55e', border: '#16a34a' }
} as const
```

### 2.2 데이터 변환 (app/composables/useDependencyGraph.ts)

- `buildGraphData(filter?)`: flatNodes → GraphData 변환
- `calculateLevels()`: BFS 기반 위상정렬로 레벨 계산
- `extractStatusCode()`: 상태 문자열에서 코드 추출
- `buildTooltip()`: HTML 툴팁 생성
- 순환 의존성 감지 및 경고

### 2.3 vis-network 캔버스 (DependencyGraph.vue)

- Hierarchical LR 레이아웃 (왼쪽→오른쪽)
- 안정화 진행률 오버레이
- 노드 클릭/더블클릭 이벤트
- expose 메서드: fit, zoomIn, zoomOut, resetZoom, focusNode, selectNode

### 2.4 모달 컴포넌트 (DependencyGraphModal.vue)

- PrimeVue Dialog (90vw x 85vh)
- 필터: 카테고리, 상태 MultiSelect
- 통계: 노드/엣지 개수
- 줌 컨트롤 버튼
- ClientOnly 래퍼 (SSR 호환)

---

## 3. 의존성 설치

```bash
npm install vis-network@^9.1.9 vis-data@^7.1.9
```

---

## 4. 검증 결과

- [x] dev 서버 정상 시작
- [x] 타입 에러 해결 (selectNode 메서드명 수정)
- [x] 그래프 버튼 WbsTreeHeader에 추가

---

## 5. 다음 단계

- `/wf:verify` 실행하여 통합테스트 수행
- 실제 브라우저에서 그래프 기능 검증
