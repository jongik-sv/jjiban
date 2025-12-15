/**
 * WBS Parser 내부 타입 정의
 * Task: TSK-02-02-01
 * 상세설계: 020-detail-design.md 섹션 2.2
 */

import type { WbsNodeType, TaskCategory, Priority, ScheduleRange } from '../../../../types';

/**
 * 파싱된 헤더 정보
 */
export interface NodeHeader {
  id: string;
  type: WbsNodeType;
  title: string;
  level: number;
}

/**
 * 파싱된 속성 모음
 */
export interface NodeAttributes {
  category?: TaskCategory;
  status?: string;
  priority?: Priority;
  assignee?: string;
  schedule?: ScheduleRange;
  tags?: string[];
  depends?: string;
  requirements?: string[];
  ref?: string;
}

/**
 * 플랫 노드 (트리 빌드 전)
 */
export interface FlatNode {
  id: string;
  type: WbsNodeType;
  title: string;
  level: number;
  attributes: NodeAttributes;
}
