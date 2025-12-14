/**
 * 설정 JSON 스키마 타입 정의
 * Task: TSK-02-03-01
 * 기술설계: 010-tech-design.md
 */

// ============================================================
// Column (칸반 컬럼) 타입 정의
// PRD 5.1 기반 6단계 칸반 컬럼
// ============================================================

/**
 * 칸반 컬럼 정의
 */
export interface Column {
  /** 컬럼 ID (고유 식별자) */
  id: string;
  /** 컬럼 표시명 */
  name: string;
  /** 단일 상태 코드 (statusCodes와 상호 배타적) */
  statusCode?: string;
  /** 복수 상태 코드 (statusCode와 상호 배타적) */
  statusCodes?: string[];
  /** 표시 순서 (1부터 시작) */
  order: number;
  /** 컬럼 색상 (hex) */
  color: string;
  /** 컬럼 설명 */
  description: string;
}

/**
 * columns.json 설정 파일 스키마
 */
export interface ColumnsConfig {
  /** JSON 스키마 참조 (선택) */
  $schema?: string;
  /** 설정 버전 */
  version: string;
  /** 칸반 컬럼 목록 */
  columns: Column[];
}

// ============================================================
// Category (카테고리) 타입 정의
// PRD 4.3 기반 3가지 카테고리
// ============================================================

/**
 * 카테고리 정의
 */
export interface Category {
  /** 카테고리 ID (고유 식별자) */
  id: string;
  /** 카테고리 표시명 */
  name: string;
  /** 카테고리 코드 (약어) */
  code: string;
  /** 카테고리 색상 (hex) */
  color: string;
  /** 아이콘 (PrimeIcons) */
  icon: string;
  /** 카테고리 설명 */
  description: string;
  /** 연결된 워크플로우 ID */
  workflowId: string;
}

/**
 * categories.json 설정 파일 스키마
 */
export interface CategoriesConfig {
  /** JSON 스키마 참조 (선택) */
  $schema?: string;
  /** 설정 버전 */
  version: string;
  /** 카테고리 목록 */
  categories: Category[];
}

// ============================================================
// Workflow (워크플로우) 타입 정의
// PRD 5.2 기반 카테고리별 상태 전이 규칙
// ============================================================

/**
 * 워크플로우 전이 규칙
 */
export interface WorkflowTransition {
  /** 시작 상태 코드 */
  from: string;
  /** 종료 상태 코드 */
  to: string;
  /** 전이 명령어 (wf:start, wf:build 등) */
  command: string;
  /** 전이 레이블 (UI 표시용) */
  label: string;
  /** 생성할 문서 파일명 (null이면 문서 없음) */
  document: string | null;
  /** 선택적 전이 여부 (생략 가능) */
  optional?: boolean;
}

/**
 * 워크플로우 정의
 */
export interface Workflow {
  /** 워크플로우 ID (고유 식별자) */
  id: string;
  /** 워크플로우 표시명 */
  name: string;
  /** 워크플로우 설명 */
  description: string;
  /** 포함된 상태 코드 목록 */
  states: string[];
  /** 초기 상태 코드 */
  initialState: string;
  /** 최종 상태 코드 목록 */
  finalStates: string[];
  /** 상태 전이 규칙 목록 */
  transitions: WorkflowTransition[];
}

/**
 * workflows.json 설정 파일 스키마
 */
export interface WorkflowsConfig {
  /** JSON 스키마 참조 (선택) */
  $schema?: string;
  /** 설정 버전 */
  version: string;
  /** 워크플로우 목록 */
  workflows: Workflow[];
}

// ============================================================
// Action (상태 내 액션) 타입 정의
// PRD 5.3 기반 상태 변경 없는 액션
// ============================================================

/**
 * 상태 내 액션 정의
 */
export interface Action {
  /** 액션 ID (고유 식별자) */
  id: string;
  /** 액션 표시명 */
  name: string;
  /** 액션 명령어 (wf:ui, wf:review 등) */
  command: string;
  /** 허용된 상태 코드 목록 */
  allowedStates: string[];
  /** 허용된 카테고리 ID 목록 */
  allowedCategories: string[];
  /** 생성할 문서 파일명 (null이면 문서 없음, 템플릿 문자열 포함 가능) */
  document: string | null;
  /** 액션 설명 */
  description: string;
}

/**
 * actions.json 설정 파일 스키마
 */
export interface ActionsConfig {
  /** JSON 스키마 참조 (선택) */
  $schema?: string;
  /** 설정 버전 */
  version: string;
  /** 액션 목록 */
  actions: Action[];
}

// ============================================================
// 통합 Settings 타입
// ============================================================

/**
 * 전체 설정 통합 인터페이스
 */
export interface Settings {
  /** 칸반 컬럼 설정 */
  columns: ColumnsConfig;
  /** 카테고리 설정 */
  categories: CategoriesConfig;
  /** 워크플로우 설정 */
  workflows: WorkflowsConfig;
  /** 액션 설정 */
  actions: ActionsConfig;
}

// ============================================================
// 설정 타입 가드 및 유틸리티
// ============================================================

/**
 * 설정 파일 타입 열거형
 */
export type SettingsFileType = 'columns' | 'categories' | 'workflows' | 'actions';

/**
 * 설정 파일명 매핑
 */
export const SETTINGS_FILE_NAMES: Record<SettingsFileType, string> = {
  columns: 'columns.json',
  categories: 'categories.json',
  workflows: 'workflows.json',
  actions: 'actions.json',
} as const;
