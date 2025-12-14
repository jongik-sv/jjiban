/**
 * 기본 설정 상수 정의
 * Task: TSK-02-03-01
 * 기술설계: 010-tech-design.md 섹션 4
 *
 * 설정 파일이 없을 경우 사용할 기본값을 정의합니다.
 */

import type {
  Column,
  ColumnsConfig,
  Category,
  CategoriesConfig,
  Workflow,
  WorkflowTransition,
  WorkflowsConfig,
  Action,
  ActionsConfig,
  Settings,
} from '../../../types/settings';

// ============================================================
// 기본 columns.json (칸반 컬럼)
// PRD 5.1 기반 6단계 칸반 컬럼
// ============================================================

export const DEFAULT_COLUMNS: ColumnsConfig = {
  version: '1.0',
  columns: [
    {
      id: 'todo',
      name: 'Todo',
      statusCode: '[ ]',
      order: 1,
      color: '#6b7280',
      description: '대기 중인 작업',
    },
    {
      id: 'design',
      name: 'Design',
      statusCode: '[bd]',
      order: 2,
      color: '#3b82f6',
      description: '기본설계 진행 중',
    },
    {
      id: 'detail',
      name: 'Detail',
      statusCodes: ['[dd]', '[an]', '[ds]'],
      order: 3,
      color: '#8b5cf6',
      description: '상세설계/분석/설계 진행 중',
    },
    {
      id: 'implement',
      name: 'Implement',
      statusCodes: ['[im]', '[fx]'],
      order: 4,
      color: '#f59e0b',
      description: '구현/수정 진행 중',
    },
    {
      id: 'verify',
      name: 'Verify',
      statusCode: '[vf]',
      order: 5,
      color: '#22c55e',
      description: '검증 진행 중',
    },
    {
      id: 'done',
      name: 'Done',
      statusCode: '[xx]',
      order: 6,
      color: '#10b981',
      description: '완료된 작업',
    },
  ],
};

// ============================================================
// 기본 categories.json (카테고리)
// PRD 4.3 기반 3가지 카테고리
// ============================================================

export const DEFAULT_CATEGORIES: CategoriesConfig = {
  version: '1.0',
  categories: [
    {
      id: 'development',
      name: 'Development',
      code: 'dev',
      color: '#3b82f6',
      icon: 'pi-code',
      description: '신규 기능 개발 작업',
      workflowId: 'development',
    },
    {
      id: 'defect',
      name: 'Defect',
      code: 'defect',
      color: '#ef4444',
      icon: 'pi-exclamation-triangle',
      description: '결함 수정 작업',
      workflowId: 'defect',
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      code: 'infra',
      color: '#8b5cf6',
      icon: 'pi-cog',
      description: '인프라, 리팩토링 등 기술 작업',
      workflowId: 'infrastructure',
    },
  ],
};

// ============================================================
// 기본 workflows.json (워크플로우 규칙)
// PRD 5.2 기반 카테고리별 상태 전이 규칙
// ============================================================

export const DEFAULT_WORKFLOWS: WorkflowsConfig = {
  version: '1.0',
  workflows: [
    {
      id: 'development',
      name: 'Development Workflow',
      description: '신규 기능 개발 워크플로우',
      states: ['[ ]', '[bd]', '[dd]', '[im]', '[vf]', '[xx]'],
      initialState: '[ ]',
      finalStates: ['[xx]'],
      transitions: [
        {
          from: '[ ]',
          to: '[bd]',
          command: 'start',
          label: '기본설계 시작',
          document: '010-basic-design.md',
        },
        {
          from: '[bd]',
          to: '[dd]',
          command: 'draft',
          label: '상세설계 시작',
          document: '020-detail-design.md',
        },
        {
          from: '[dd]',
          to: '[im]',
          command: 'build',
          label: '구현 시작',
          document: '030-implementation.md',
        },
        {
          from: '[im]',
          to: '[vf]',
          command: 'verify',
          label: '통합테스트 시작',
          document: '070-integration-test.md',
        },
        {
          from: '[vf]',
          to: '[xx]',
          command: 'done',
          label: '작업 완료',
          document: '080-manual.md',
        },
      ],
    },
    {
      id: 'defect',
      name: 'Defect Workflow',
      description: '결함 수정 워크플로우',
      states: ['[ ]', '[an]', '[fx]', '[vf]', '[xx]'],
      initialState: '[ ]',
      finalStates: ['[xx]'],
      transitions: [
        {
          from: '[ ]',
          to: '[an]',
          command: 'start',
          label: '분석 시작',
          document: '010-defect-analysis.md',
        },
        {
          from: '[an]',
          to: '[fx]',
          command: 'fix',
          label: '수정 시작',
          document: '030-implementation.md',
        },
        {
          from: '[fx]',
          to: '[vf]',
          command: 'verify',
          label: '검증 시작',
          document: '070-test-results.md',
        },
        {
          from: '[vf]',
          to: '[xx]',
          command: 'done',
          label: '작업 완료',
          document: null,
        },
      ],
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure Workflow',
      description: '인프라/리팩토링 워크플로우',
      states: ['[ ]', '[dd]', '[im]', '[xx]'],
      initialState: '[ ]',
      finalStates: ['[xx]'],
      transitions: [
        {
          from: '[ ]',
          to: '[dd]',
          command: 'start',
          label: '설계 시작',
          document: '010-tech-design.md',
          optional: true,
        },
        {
          from: '[ ]',
          to: '[im]',
          command: 'skip',
          label: '설계 생략, 구현 시작',
          document: '030-implementation.md',
        },
        {
          from: '[dd]',
          to: '[im]',
          command: 'build',
          label: '구현 시작',
          document: '030-implementation.md',
        },
        {
          from: '[im]',
          to: '[xx]',
          command: 'done',
          label: '작업 완료',
          document: null,
        },
      ],
    },
  ],
};

// ============================================================
// 기본 actions.json (상태 내 액션)
// PRD 5.3 기반 상태 변경 없는 액션
// ============================================================

export const DEFAULT_ACTIONS: ActionsConfig = {
  version: '1.0',
  actions: [
    {
      id: 'ui',
      name: '화면설계',
      command: 'ui',
      allowedStates: ['[bd]'],
      allowedCategories: ['development'],
      document: '011-ui-design.md',
      description: '화면설계 문서 작성',
    },
    {
      id: 'review',
      name: '설계 리뷰',
      command: 'review',
      allowedStates: ['[dd]'],
      allowedCategories: ['development'],
      document: '021-design-review-{llm}-{n}.md',
      description: 'LLM 설계 리뷰 수행',
    },
    {
      id: 'apply',
      name: '리뷰 반영',
      command: 'apply',
      allowedStates: ['[dd]'],
      allowedCategories: ['development'],
      document: null,
      description: '설계 리뷰 내용 반영',
    },
    {
      id: 'test',
      name: 'TDD/E2E 테스트',
      command: 'test',
      allowedStates: ['[im]', '[fx]'],
      allowedCategories: ['development', 'defect'],
      document: '070-tdd-test-results.md',
      description: 'TDD/E2E 테스트 실행',
    },
    {
      id: 'audit',
      name: '코드 리뷰',
      command: 'audit',
      allowedStates: ['[im]', '[fx]'],
      allowedCategories: ['development', 'defect'],
      document: '031-code-review-{llm}-{n}.md',
      description: 'LLM 코드 리뷰 수행',
    },
    {
      id: 'patch',
      name: '코드 리뷰 반영',
      command: 'patch',
      allowedStates: ['[im]', '[fx]'],
      allowedCategories: ['development', 'defect'],
      document: null,
      description: '코드 리뷰 내용 반영',
    },
  ],
};

// ============================================================
// 통합 기본 설정
// ============================================================

/**
 * 전체 기본 설정
 */
export const DEFAULT_SETTINGS: Settings = {
  columns: DEFAULT_COLUMNS,
  categories: DEFAULT_CATEGORIES,
  workflows: DEFAULT_WORKFLOWS,
  actions: DEFAULT_ACTIONS,
};

// ============================================================
// 헬퍼 함수
// ============================================================

/**
 * 상태 코드로 컬럼 찾기
 * @param statusCode 상태 코드 (예: '[im]')
 * @returns 해당 컬럼 또는 undefined
 */
export function findColumnByStatus(statusCode: string): Column | undefined {
  return DEFAULT_COLUMNS.columns.find((col: Column) => {
    if (col.statusCode === statusCode) return true;
    if (col.statusCodes?.includes(statusCode)) return true;
    return false;
  });
}

/**
 * 카테고리 ID로 워크플로우 찾기
 * @param categoryId 카테고리 ID (예: 'development')
 * @returns 해당 워크플로우 또는 undefined
 */
export function findWorkflowByCategory(categoryId: string): Workflow | undefined {
  const category = DEFAULT_CATEGORIES.categories.find((cat: Category) => cat.id === categoryId);
  if (!category) return undefined;
  return DEFAULT_WORKFLOWS.workflows.find((wf: Workflow) => wf.id === category.workflowId);
}

/**
 * 현재 상태에서 사용 가능한 전이 목록 조회
 * @param workflowId 워크플로우 ID
 * @param currentState 현재 상태 코드
 * @returns 사용 가능한 전이 목록
 */
export function getAvailableTransitions(workflowId: string, currentState: string): WorkflowTransition[] {
  const workflow = DEFAULT_WORKFLOWS.workflows.find((wf: Workflow) => wf.id === workflowId);
  if (!workflow) return [];
  return workflow.transitions.filter((t: WorkflowTransition) => t.from === currentState);
}

/**
 * 현재 상태에서 사용 가능한 액션 목록 조회
 * @param categoryId 카테고리 ID
 * @param currentState 현재 상태 코드
 * @returns 사용 가능한 액션 목록
 */
export function getAvailableActions(categoryId: string, currentState: string): Action[] {
  return DEFAULT_ACTIONS.actions.filter(
    (action: Action) =>
      action.allowedCategories.includes(categoryId) &&
      action.allowedStates.includes(currentState)
  );
}
