/**
 * 프로젝트 메타데이터 타입 정의
 * Task: TSK-02-03-03
 * 상세설계: 020-detail-design.md 섹션 6
 */

// ============================================================
// Entity Types
// ============================================================

/**
 * 프로젝트 목록 항목 (projects.json 내 항목)
 */
export interface ProjectListItem {
  id: string;
  name: string;
  path: string;
  status: 'active' | 'archived';
  wbsDepth: 3 | 4;
  createdAt: string; // ISO 8601
}

/**
 * 전역 프로젝트 목록 설정 (projects.json)
 */
export interface ProjectsConfig {
  version: string;
  projects: ProjectListItem[];
  defaultProject?: string | null;
}

/**
 * 개별 프로젝트 메타데이터 (project.json)
 */
export interface ProjectConfig {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: 'active' | 'archived';
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  scheduledStart?: string; // ISO date (YYYY-MM-DD)
  scheduledEnd?: string; // ISO date (YYYY-MM-DD)
}

/**
 * 팀원
 */
export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
  active: boolean;
}

/**
 * 팀원 목록 설정 (team.json)
 */
export interface TeamConfig {
  version: string;
  members: TeamMember[];
}

/**
 * 프로젝트 상세 응답 (project + team)
 */
export interface ProjectDetail {
  project: ProjectConfig;
  team: TeamMember[];
}

// ============================================================
// DTO Types (API Request/Response)
// ============================================================

/**
 * 프로젝트 생성 요청
 */
export interface CreateProjectDto {
  id: string;
  name: string;
  description?: string;
  wbsDepth?: 3 | 4;
  scheduledStart?: string;
  scheduledEnd?: string;
}

/**
 * 프로젝트 수정 요청
 */
export interface UpdateProjectDto {
  name?: string;
  description?: string;
  version?: string;
  status?: 'active' | 'archived';
  scheduledStart?: string;
  scheduledEnd?: string;
}

/**
 * 팀원 수정 요청
 */
export interface UpdateTeamDto {
  members: TeamMember[];
}

/**
 * 프로젝트 목록 응답
 */
export interface ProjectListResponse {
  projects: ProjectListItem[];
  defaultProject: string | null;
  total: number;
}

/**
 * 팀원 목록 응답
 */
export interface TeamResponse {
  members: TeamMember[];
  total: number;
}
