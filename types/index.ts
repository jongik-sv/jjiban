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
  type: 'design' | 'implementation' | 'test' | 'manual';
}

// 이력 엔트리
export interface HistoryEntry {
  timestamp: string;
  action: string;
  from?: string;
  to?: string;
  user?: string;
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
