/**
 * Terminal & Workflow Types
 * Task: TSK-02-03
 * 상세설계: 020-detail-design.md 섹션 2
 *
 * 터미널 세션, 입출력, 워크플로우 명령어 관련 타입 정의
 */

import type { TaskCategory } from '~/types/index'

// ============================================================
// Terminal Session Types
// ============================================================

/**
 * 터미널 세션 상태
 */
export type TerminalSessionStatus =
  | 'connecting'  // 연결 시도 중
  | 'connected'   // 연결됨 (대기)
  | 'running'     // 명령어 실행 중
  | 'completed'   // 명령어 완료
  | 'error'       // 에러 발생

/**
 * 터미널 세션 정보
 * node-pty로 생성된 터미널 프로세스를 나타냄
 */
export interface TerminalSession {
  id: string                          // 세션 ID (UUID)
  pid: number                         // 터미널 프로세스 PID (node-pty)
  taskId?: string                     // 연결된 Task ID (옵션)
  projectId?: string                  // 연결된 프로젝트 ID (옵션)
  status: TerminalSessionStatus       // 현재 상태
  currentCommand?: string             // 실행 중인 명령어 (예: "/wf:build")
  createdAt: string                   // 생성 시각 (ISO 8601)
  updatedAt: string                   // 최종 업데이트 시각 (ISO 8601)
}

/**
 * 터미널 세션 생성 요청
 */
export interface CreateTerminalSessionRequest {
  taskId?: string       // Task ID (옵션)
  projectId?: string    // 프로젝트 ID (옵션)
  cols: number          // 터미널 너비 (기본: 80)
  rows: number          // 터미널 높이 (기본: 24)
}

/**
 * 터미널 세션 생성 응답
 */
export interface CreateTerminalSessionResponse {
  success: boolean
  sessionId: string
  status: TerminalSessionStatus
  createdAt: string
  error?: string
}

/**
 * 터미널 세션 목록 조회 응답
 */
export interface TerminalSessionListResponse {
  sessions: TerminalSession[]
  total: number
}

// ============================================================
// Terminal I/O Types
// ============================================================

/**
 * 터미널 출력 타입
 */
export type TerminalOutputType =
  | 'stdout'   // 표준 출력
  | 'stderr'   // 표준 에러
  | 'system'   // 시스템 메시지 (세션 생성/종료 등)

/**
 * 터미널 출력 데이터
 * SSE로 전송되는 출력 단위
 */
export interface TerminalOutput {
  type: TerminalOutputType
  text: string                        // 출력 텍스트 (ANSI 이스케이프 포함 가능)
  timestamp: string                   // 출력 시각 (ISO 8601)
}

/**
 * 터미널 입력 요청
 */
export interface TerminalInputRequest {
  input: string                       // 입력 텍스트 (개행 포함 가능)
}

/**
 * 터미널 리사이즈 요청
 */
export interface TerminalResizeRequest {
  cols: number                        // 새 너비
  rows: number                        // 새 높이
}

// ============================================================
// Workflow Types
// ============================================================

/**
 * PrimeVue Button severity 타입
 */
export type ButtonSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'

/**
 * 워크플로우 명령어 메타데이터
 * 버튼 UI 및 가용성 판단에 사용
 */
export interface WorkflowCommand {
  name: string                        // 명령어 이름 (예: "start", "build")
  label: string                       // 버튼 레이블 (예: "시작", "구현")
  icon: string                        // PrimeIcon 클래스 (예: "pi-play")
  severity: ButtonSeverity
  availableStatuses: string[]         // 사용 가능한 상태 목록 (예: ["[ ]"])
  categories: TaskCategory[]
  description?: string                // 설명 (툴팁)
}

/**
 * 워크플로우 실행 요청
 */
export interface WorkflowExecuteRequest {
  taskId: string                      // 대상 Task ID
  projectId: string                   // 프로젝트 ID
  command: string                     // 명령어 이름 (예: "build")
  options?: {
    until?: string                    // 중간 단계까지만 실행 (auto 명령어용)
    skipReview?: boolean              // 설계 리뷰 생략
    skipAudit?: boolean               // 코드 리뷰 생략
    dryRun?: boolean                  // 시뮬레이션 모드
    maxTasks?: number                 // 최대 Task 수 (run 명령어용)
  }
}

/**
 * 워크플로우 실행 응답
 */
export interface WorkflowExecuteResponse {
  success: boolean
  sessionId?: string                  // 터미널 세션 ID
  taskId?: string
  command?: string
  prompt?: string                     // 생성된 프롬프트 문자열
  error?: string
  message?: string
}

/**
 * Task별 사용 가능 명령어 조회 응답
 */
export interface AvailableCommandsResponse {
  success: boolean
  commands: WorkflowCommand[]         // 사용 가능한 명령어 목록
  task?: {
    status: string
    category: TaskCategory
  }
  error?: string
}

// ============================================================
// Execution Types (ExecutionStore 연동)
// ============================================================

/**
 * 워크플로우 실행 정보
 * ExecutionManager에서 관리하는 실행 상태
 */
export interface ExecutionInfo {
  taskId: string                      // Task ID
  command: string                     // 실행 중인 명령어
  sessionId: string                   // 터미널 세션 ID
  pid?: number                        // 터미널 프로세스 PID
  startedAt: string                   // 시작 시각 (ISO 8601)
}

/**
 * 실행 상태 조회 응답
 */
export interface ExecutionStatusResponse {
  executingTaskIds: string[]          // 실행 중인 Task ID 목록
  executions: ExecutionInfo[]         // 실행 정보 목록
  count: number                       // 실행 중인 Task 수
  cleanedStale: number                // 정리된 Stale Execution 수
}

// ============================================================
// Workflow Commands Constants
// ============================================================

/**
 * 워크플로우 명령어 메타데이터 (15개)
 * 클라이언트 측 기본값 (서버 API가 실패하면 사용)
 */
export const WORKFLOW_COMMANDS: WorkflowCommand[] = [
  {
    name: 'start',
    label: '시작',
    icon: 'pi-play',
    severity: 'primary',
    availableStatuses: ['[ ]'],
    categories: ['development', 'defect', 'infrastructure'],
    description: '워크플로우 시작'
  },
  {
    name: 'ui',
    label: '화면설계',
    icon: 'pi-palette',
    severity: 'info',
    availableStatuses: ['[bd]'],
    categories: ['development'],
    description: '화면설계 작성'
  },
  {
    name: 'draft',
    label: '상세설계',
    icon: 'pi-file-edit',
    severity: 'info',
    availableStatuses: ['[bd]'],
    categories: ['development'],
    description: '상세설계로 전환'
  },
  {
    name: 'review',
    label: '설계리뷰',
    icon: 'pi-eye',
    severity: 'secondary',
    availableStatuses: ['[dd]'],
    categories: ['development'],
    description: '설계 리뷰 요청'
  },
  {
    name: 'apply',
    label: '리뷰반영',
    icon: 'pi-check-circle',
    severity: 'secondary',
    availableStatuses: ['[dd]'],
    categories: ['development'],
    description: '설계 리뷰 반영'
  },
  {
    name: 'approve',
    label: '승인',
    icon: 'pi-check-circle',
    severity: 'success',
    availableStatuses: ['[dd]'],
    categories: ['development'],
    description: '설계 승인'
  },
  {
    name: 'build',
    label: '구현',
    icon: 'pi-code',
    severity: 'primary',
    availableStatuses: ['[ap]', '[ds]'],
    categories: ['development', 'infrastructure'],
    description: 'TDD 기반 구현'
  },
  {
    name: 'test',
    label: '테스트',
    icon: 'pi-cog',
    severity: 'secondary',
    availableStatuses: ['[im]'],
    categories: ['development'],
    description: '테스트 실행'
  },
  {
    name: 'audit',
    label: '코드리뷰',
    icon: 'pi-search',
    severity: 'secondary',
    availableStatuses: ['[im]', '[fx]'],
    categories: ['development'],
    description: '코드 리뷰 요청'
  },
  {
    name: 'patch',
    label: '리뷰반영',
    icon: 'pi-check',
    severity: 'secondary',
    availableStatuses: ['[im]', '[fx]'],
    categories: ['development'],
    description: '코드 리뷰 반영'
  },
  {
    name: 'verify',
    label: '검증',
    icon: 'pi-verified',
    severity: 'success',
    availableStatuses: ['[im]', '[fx]'],
    categories: ['development', 'defect'],
    description: '통합테스트'
  },
  {
    name: 'done',
    label: '완료',
    icon: 'pi-check-circle',
    severity: 'success',
    availableStatuses: ['[vf]', '[im]'],
    categories: ['development', 'defect', 'infrastructure'],
    description: '완료 처리'
  },
  {
    name: 'fix',
    label: '수정',
    icon: 'pi-wrench',
    severity: 'danger',
    availableStatuses: ['[an]'],
    categories: ['defect'],
    description: '결함 수정'
  },
  {
    name: 'skip',
    label: '설계생략',
    icon: 'pi-forward',
    severity: 'secondary',
    availableStatuses: ['[ ]'],
    categories: ['infrastructure'],
    description: '설계 생략하고 구현'
  },
  {
    name: 'run',
    label: '병렬실행',
    icon: 'pi-play-circle',
    severity: 'primary',
    availableStatuses: ['[ ]', '[bd]', '[dd]', '[im]', '[vf]'],
    categories: ['development', 'defect', 'infrastructure'],
    description: '병렬 자동 실행'
  },
  {
    name: 'auto',
    label: '순차실행',
    icon: 'pi-fast-forward',
    severity: 'primary',
    availableStatuses: ['[ ]', '[bd]', '[dd]', '[im]', '[vf]'],
    categories: ['development', 'defect', 'infrastructure'],
    description: '순차 자동 실행'
  }
]

// ============================================================
// Helper Functions
// ============================================================

/**
 * 카테고리와 상태로 명령어 필터링
 */
export function filterWorkflowCommands(
  commands: WorkflowCommand[],
  category: TaskCategory,
  status: string
): WorkflowCommand[] {
  return commands.filter(cmd => {
    const categoryMatch = cmd.categories.includes(category)
    const statusMatch = cmd.availableStatuses.includes(status)
    return categoryMatch && statusMatch
  })
}

/**
 * 명령어 이름으로 명령어 메타데이터 조회
 */
export function getWorkflowCommandByName(name: string): WorkflowCommand | undefined {
  return WORKFLOW_COMMANDS.find(cmd => cmd.name === name)
}
