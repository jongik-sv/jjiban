/**
 * Pinia Store 관련 타입 정의
 * Task: TSK-01-01-03
 */

// ============================================================
// 프로젝트 관련 타입
// ============================================================

export interface Project {
  id: string
  name: string
  description?: string
  version: string
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
  scheduledStart?: string
  scheduledEnd?: string
}

export interface ProjectSummary {
  id: string
  name: string
  path: string
  status: 'active' | 'archived'
  wbsDepth: 3 | 4
  createdAt: string
}

export interface ProjectListResponse {
  projects: ProjectSummary[]
  defaultProject: string | null
  total: number
}

export interface CreateProjectInput {
  name: string
  description?: string
  scheduledStart?: string
  scheduledEnd?: string
}

// ============================================================
// WBS 관련 타입
// ============================================================

export type WbsNodeType = 'project' | 'wp' | 'act' | 'task'

export interface WbsNode {
  id: string
  type: WbsNodeType
  title: string
  status?: string
  category?: string
  priority?: string
  progress: number
  taskCount: number
  children: WbsNode[]
  expanded?: boolean
}

// ============================================================
// Task 상세 타입
// ============================================================

export interface TeamMember {
  id: string
  name: string
  avatar?: string
  role?: string
}

export interface DocumentInfo {
  filename: string
  path: string
  exists: boolean
  type: 'basic-design' | 'detail-design' | 'implementation' | 'test' | 'manual' | 'other'
}

export interface HistoryEntry {
  timestamp: string
  action: string
  fromStatus?: string
  toStatus?: string
  description?: string
}

export interface TaskDetail {
  id: string
  title: string
  category: string
  status: string
  priority: string
  assignee?: TeamMember
  parentWp: string
  parentAct?: string
  requirements: string[]
  ref?: string
  schedule?: {
    start: string
    end: string
  }
  tags?: string[]
  depends?: string[]
  documents: DocumentInfo[]
  history: HistoryEntry[]
  availableActions: string[]
}

// ============================================================
// 설정 관련 타입
// ============================================================

export interface ColumnDef {
  id: string
  name: string
  statuses: string[]
  color: string
}

export interface CategoryDef {
  id: string
  name: string
  code: string
  workflow: string
}

export interface TransitionDef {
  from: string
  to: string
  command: string
  description?: string
}

export interface WorkflowDef {
  id: string
  category: string
  transitions: TransitionDef[]
}

export interface ActionDef {
  command: string
  status: string[]
  description: string
  output?: string
}
