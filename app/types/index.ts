// WBS 노드 타입
export type WbsNodeType = 'project' | 'wp' | 'act' | 'task';

// Task 카테고리
export type TaskCategory = 'development' | 'defect' | 'infrastructure';

// Task 상태 코드
export type TaskStatus = '[ ]' | '[bd]' | '[dd]' | '[an]' | '[ds]' | '[im]' | '[fx]' | '[vf]' | '[xx]';

// 우선순위
export type Priority = 'critical' | 'high' | 'medium' | 'low';

// 일정 범위
export interface ScheduleRange {
  start: string;  // YYYY-MM-DD
  end: string;    // YYYY-MM-DD
}

// WBS 메타데이터
export interface WbsMetadata {
  version: string;
  depth: 3 | 4;
  updated: string;  // YYYY-MM-DD
  start: string;    // YYYY-MM-DD
}

// 단계별 완료시각 타입 (TSK-03-06)
export type CompletedTimestamps = Record<string, string>;  // { bd: "2025-12-15 10:30", dd: "2025-12-15 14:20" }

// WBS 노드 인터페이스 (확장)
export interface WbsNode {
  id: string;
  type: WbsNodeType;
  title: string;
  status?: string;  // 파서 호환을 위해 string으로 확장 (예: "detail-design [dd]")
  category?: TaskCategory;
  priority?: Priority;
  assignee?: string;
  schedule?: ScheduleRange;
  tags?: string[];
  depends?: string;
  requirements?: string[];
  ref?: string;
  progress?: number;
  taskCount?: number;
  children: WbsNode[];
  expanded?: boolean;
  attributes?: Record<string, string>;  // TSK-03-05: 커스텀 속성 (예: test-result)
  completed?: CompletedTimestamps;  // TSK-03-06: 단계별 완료시각 (예: { bd: "2025-12-15 10:30" })
}

// 시리얼라이저 컨텍스트
export interface SerializerContext {
  currentDepth: number;
  wpCount: number;
  maxDepth: number;
  visited: Set<string>;
}

// 시리얼라이저 옵션
export interface SerializerOptions {
  updateDate?: boolean;  // updated 필드를 현재 날짜로 갱신할지 여부
}

// 시리얼라이저 에러
export class SerializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SerializationError';
  }
}

// Task 상세 정보
export interface TaskDetail {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: Priority;
  assignee?: TeamMember;
  parentWp: string;
  parentAct?: string;
  schedule?: {
    start: string;
    end: string;
  };
  requirements: string[];
  tags: string[];
  depends?: string[];
  ref?: string;
  documents: DocumentInfo[];
  history: HistoryEntry[];
  availableActions: string[];
}

// 팀 멤버
export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

// 문서 정보
export interface DocumentInfo {
  name: string;
  path: string;
  exists: boolean;
  type: 'design' | 'implementation' | 'test' | 'manual' | 'analysis' | 'review';
  stage: 'current' | 'expected';
  size?: number;                    // exists=true일 때만
  createdAt?: string;               // exists=true일 때만
  updatedAt?: string;               // exists=true일 때만
  expectedAfter?: string;           // exists=false일 때만
  command?: string;                 // exists=false일 때만
}

// 이력 엔트리
export interface HistoryEntry {
  taskId?: string;
  timestamp: string;
  userId?: string;
  action: 'transition' | 'action' | 'update' | string;
  previousStatus?: string;
  newStatus?: string;
  command?: string;
  comment?: string;
  documentCreated?: string;
  // 기존 호환성 유지
  from?: string;
  to?: string;
  user?: string | null;
}

// 상태 전이 결과
export interface TransitionResult {
  success: boolean;
  taskId: string;
  previousStatus?: string;
  newStatus?: string;
  command?: string;
  documentCreated?: string;
  error?: string;
  message?: string;
  timestamp: string;
}

// 프로젝트 정보
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'completed';
  wbsDepth: 3 | 4;
  createdAt: string;
  updatedAt?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
}

// 칸반 컬럼
export interface Column {
  id: string;
  name: string;
  statuses: string[];
}

// 카테고리 설정
export interface CategoryConfig {
  id: string;
  name: string;
  code: string;
}

// 워크플로우 규칙
export interface WorkflowRule {
  category: string;
  from: string;
  to: string;
  command: string;
}

// 워크플로우 단계 (TSK-05-02 R-02: 타입 정의 추출)
export interface WorkflowStep {
  code: string;        // 상태 코드 (예: '[ ]', '[bd]', '[dd]', '[im]', '[vf]', '[xx]')
  name: string;        // 상태 이름 (예: 'Todo', 'Design', 'Detail', 'Implement', 'Verify', 'Done')
  description: string; // 상태 설명 (예: '시작 전', '기본설계', '상세설계')
}

// 카테고리별 워크플로우 단계 정의
export const WORKFLOW_STEPS: Record<TaskCategory, WorkflowStep[]> = {
  development: [
    { code: '[ ]', name: 'Todo', description: '시작 전' },
    { code: '[bd]', name: 'Design', description: '기본설계' },
    { code: '[dd]', name: 'Detail', description: '상세설계' },
    { code: '[im]', name: 'Implement', description: '구현' },
    { code: '[vf]', name: 'Verify', description: '검증' },
    { code: '[xx]', name: 'Done', description: '완료' }
  ],
  defect: [
    { code: '[ ]', name: 'Todo', description: '시작 전' },
    { code: '[an]', name: 'Analysis', description: '분석' },
    { code: '[fx]', name: 'Fix', description: '수정' },
    { code: '[vf]', name: 'Verify', description: '검증' },
    { code: '[xx]', name: 'Done', description: '완료' }
  ],
  infrastructure: [
    { code: '[ ]', name: 'Todo', description: '시작 전' },
    { code: '[ds]', name: 'Design', description: '설계' },
    { code: '[im]', name: 'Implement', description: '구현' },
    { code: '[xx]', name: 'Done', description: '완료' }
  ]
};

// JJIBAN 디렉토리 경로 상수
export const JJIBAN_PATHS = {
  ROOT: '.jjiban',
  SETTINGS: '.jjiban/settings',
  TEMPLATES: '.jjiban/templates',
  PROJECTS: '.jjiban/projects',
} as const;

// 설정 파일명 상수
export const SETTINGS_FILES = {
  PROJECTS: 'projects.json',
  COLUMNS: 'columns.json',
  CATEGORIES: 'categories.json',
  WORKFLOWS: 'workflows.json',
  ACTIONS: 'actions.json',
} as const;

// 워크플로우 상태 인터페이스
export interface WorkflowState {
  taskId: string;
  category: TaskCategory;
  currentState: string;
  currentStateName: string;
  workflow: {
    id: string;
    name: string;
    states: string[];
    transitions: any[];
  };
  availableCommands: string[];
}

// 워크플로우 이력 인터페이스
export interface WorkflowHistory {
  taskId: string;
  timestamp: string;
  action: 'transition' | 'update';
  previousStatus?: string;
  newStatus?: string;
  command?: string;
  comment?: string;
  documentCreated?: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 페이징 정보
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 페이징된 응답
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

// Document Viewer 타입 (TSK-05-04)
export interface DocumentError {
  code: string;           // 에러 코드 (DOCUMENT_NOT_FOUND, FILE_READ_ERROR 등)
  message: string;        // 사용자 메시지
  isRecoverable: boolean; // 복구 가능 여부 (재시도 버튼 표시 여부)
  originalError?: Error;  // 원본 에러 (디버깅용)
}

export interface DocumentContent {
  content: string;        // Markdown 원본 텍스트
  filename: string;       // 파일명
  size: number;          // 파일 크기 (bytes)
  lastModified: string;  // 최종 수정 시각 (ISO 8601)
}
