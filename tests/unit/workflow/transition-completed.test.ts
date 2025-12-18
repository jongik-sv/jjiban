/**
 * 단위 테스트: executeTransition 롤백 로직 (TSK-03-06)
 * 테스트 명세: 026-test-specification.md (UT-007, UT-008, UT-009)
 *
 * v2.0 스키마 적용 (Record 기반 워크플로우)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { WbsNode, WbsMetadata } from '../../../types';
import type { WorkflowsConfig } from '../../../types/settings';

// Mock dependencies
vi.mock('../../../server/utils/wbs/wbsService');
vi.mock('../../../server/utils/settings');

import { executeTransition } from '../../../server/utils/workflow/transitionService';
import { getWbsTree, saveWbsTree } from '../../../server/utils/wbs/wbsService';
import { getWorkflows } from '../../../server/utils/settings';

describe('executeTransition - 롤백 로직', () => {
  let mockGetWbsTree: ReturnType<typeof vi.fn>;
  let mockSaveWbsTree: ReturnType<typeof vi.fn>;
  let mockGetWorkflows: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetWbsTree = vi.mocked(getWbsTree);
    mockSaveWbsTree = vi.mocked(saveWbsTree);
    mockGetWorkflows = vi.mocked(getWorkflows);

    // Default mock implementations
    mockSaveWbsTree.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * v2.0 스키마 기본 워크플로우 설정 생성
   */
  function createMockWorkflowsConfig(
    category: string,
    states: string[],
    transitions: Array<{ from: string; to: string; command: string }>
  ): WorkflowsConfig {
    return {
      version: '2.0',
      states: {
        '[ ]': { id: 'todo', label: '시작 전', labelEn: 'Todo', icon: 'pi-inbox', color: '#6b7280', severity: 'secondary', progressWeight: 0 },
        '[bd]': { id: 'basic-design', label: '기본설계', labelEn: 'Basic Design', icon: 'pi-pencil', color: '#3b82f6', severity: 'info', progressWeight: 20 },
        '[dd]': { id: 'detail-design', label: '상세설계', labelEn: 'Detail Design', icon: 'pi-file-edit', color: '#8b5cf6', severity: 'info', progressWeight: 40 },
        '[ap]': { id: 'approve', label: '승인', labelEn: 'Approve', icon: 'pi-check-square', color: '#10b981', severity: 'success', progressWeight: 50 },
        '[im]': { id: 'implement', label: '구현', labelEn: 'Implement', icon: 'pi-code', color: '#f59e0b', severity: 'warning', progressWeight: 60 },
        '[vf]': { id: 'verify', label: '검증', labelEn: 'Verify', icon: 'pi-verified', color: '#22c55e', severity: 'success', progressWeight: 80 },
        '[xx]': { id: 'done', label: '완료', labelEn: 'Done', icon: 'pi-check-circle', color: '#10b981', severity: 'success', progressWeight: 100 },
        '[an]': { id: 'analysis', label: '분석', labelEn: 'Analysis', icon: 'pi-search', color: '#f59e0b', severity: 'warning', progressWeight: 30 },
        '[fx]': { id: 'fix', label: '수정', labelEn: 'Fix', icon: 'pi-wrench', color: '#ef4444', severity: 'danger', progressWeight: 60 },
      },
      commands: {
        start: { label: '시작', labelEn: 'Start', icon: 'pi-play', severity: 'primary' },
        draft: { label: '상세설계', labelEn: 'Draft', icon: 'pi-pencil', severity: 'info' },
        approve: { label: '승인', labelEn: 'Approve', icon: 'pi-check', severity: 'success' },
        build: { label: '구현', labelEn: 'Build', icon: 'pi-wrench', severity: 'warning' },
        verify: { label: '검증', labelEn: 'Verify', icon: 'pi-verified', severity: 'success' },
        done: { label: '완료', labelEn: 'Done', icon: 'pi-check-circle', severity: 'success' },
        fix: { label: '수정', labelEn: 'Fix', icon: 'pi-wrench', severity: 'danger' },
      },
      workflows: {
        [category]: {
          name: `${category.charAt(0).toUpperCase() + category.slice(1)} Workflow`,
          states,
          transitions,
        },
      },
    };
  }

  /**
   * UT-007: 롤백 감지
   * 새 상태 인덱스 < 현재 상태 인덱스인 경우 롤백으로 판단
   */
  describe('UT-007: 롤백 감지', () => {
    it('should detect rollback when new state index < current state index', async () => {
      // Arrange: development 워크플로우, [im] → [dd] 롤백
      const mockWorkflows = createMockWorkflowsConfig(
        'development',
        ['[ ]', '[bd]', '[dd]', '[im]', '[vf]', '[xx]'],
        [{ from: '[im]', to: '[dd]', command: 'draft' }]
      );

      const mockMetadata: WbsMetadata = {
        version: '1.0',
        depth: 4,
        updated: '2025-12-15',
        start: '2025-12-01',
      };

      const mockTree: WbsNode[] = [
        {
          id: 'TSK-03-06',
          type: 'task',
          title: 'Test Task',
          status: 'implement [im]',
          category: 'development',
          completed: {
            bd: '2025-12-15 10:00',
            dd: '2025-12-15 12:00',
            im: '2025-12-15 14:00',
          },
          children: [],
        },
      ];

      mockGetWorkflows.mockResolvedValue(mockWorkflows);
      mockGetWbsTree.mockResolvedValue({ metadata: mockMetadata, tree: mockTree });

      // Act: [im] → [dd] 롤백 실행
      const result = await executeTransition('TSK-03-06', 'draft');

      // Assert: 롤백 성공 및 completed 업데이트 확인
      expect(result.success).toBe(true);
      expect(result.previousStatus).toBe('im');
      expect(result.newStatus).toBe('dd');

      // saveWbsTree가 호출되었는지 확인
      expect(mockSaveWbsTree).toHaveBeenCalledTimes(1);

      // 저장된 트리에서 completed 확인
      const savedTree = mockSaveWbsTree.mock.calls[0][2] as WbsNode[];
      const updatedNode = savedTree[0];

      // 롤백으로 인해 im 키가 삭제되어야 함
      expect(updatedNode.completed).toBeDefined();
      expect(updatedNode.completed?.bd).toBe('2025-12-15 10:00'); // 유지
      expect(updatedNode.completed?.dd).toBeDefined(); // 갱신됨
      expect(updatedNode.completed?.im).toBeUndefined(); // 삭제됨
    });
  });

  /**
   * UT-008: 이후 단계 completed 삭제
   * 롤백 시 워크플로우 순서 기반으로 이후 단계의 completed 키를 모두 삭제
   */
  describe('UT-008: 이후 단계 completed 삭제', () => {
    it('should delete completed keys for subsequent states on rollback', async () => {
      // Arrange: development 워크플로우, [im] → [dd] 롤백
      // 기존 completed: { bd, dd, im, vf }
      const mockWorkflows = createMockWorkflowsConfig(
        'development',
        ['[ ]', '[bd]', '[dd]', '[im]', '[vf]', '[xx]'],
        [{ from: '[im]', to: '[dd]', command: 'draft' }]
      );

      const mockMetadata: WbsMetadata = {
        version: '1.0',
        depth: 4,
        updated: '2025-12-15',
        start: '2025-12-01',
      };

      const mockTree: WbsNode[] = [
        {
          id: 'TSK-03-06',
          type: 'task',
          title: 'Test Task',
          status: 'implement [im]',
          category: 'development',
          completed: {
            bd: '2025-12-15 10:00',
            dd: '2025-12-15 12:00',
            im: '2025-12-15 14:00',
            vf: '2025-12-15 16:00', // 잘못된 데이터 (im에서 vf로 건너뛸 수 없음)
          },
          children: [],
        },
      ];

      mockGetWorkflows.mockResolvedValue(mockWorkflows);
      mockGetWbsTree.mockResolvedValue({ metadata: mockMetadata, tree: mockTree });

      // Act: [im] → [dd] 롤백 실행
      const result = await executeTransition('TSK-03-06', 'draft');

      // Assert
      expect(result.success).toBe(true);

      // 저장된 트리 확인
      const savedTree = mockSaveWbsTree.mock.calls[0][2] as WbsNode[];
      const updatedNode = savedTree[0];

      // 롤백 이전 단계 유지
      expect(updatedNode.completed?.bd).toBe('2025-12-15 10:00');

      // 롤백 대상 단계 갱신
      expect(updatedNode.completed?.dd).toBeDefined();
      expect(updatedNode.completed?.dd).not.toBe('2025-12-15 12:00'); // 새 타임스탬프로 갱신됨

      // 롤백 이후 단계 삭제
      expect(updatedNode.completed?.im).toBeUndefined();
      expect(updatedNode.completed?.vf).toBeUndefined();
      expect(updatedNode.completed?.xx).toBeUndefined();
    });

    it('should handle defect workflow rollback correctly', async () => {
      // Arrange: defect 워크플로우, [fx] → [an] 롤백
      const mockWorkflows = createMockWorkflowsConfig(
        'defect',
        ['[ ]', '[an]', '[fx]', '[vf]', '[xx]'],
        [{ from: '[fx]', to: '[an]', command: 'start' }]
      );

      const mockMetadata: WbsMetadata = {
        version: '1.0',
        depth: 4,
        updated: '2025-12-15',
        start: '2025-12-01',
      };

      const mockTree: WbsNode[] = [
        {
          id: 'TSK-DEFECT-01',
          type: 'task',
          title: 'Defect Task',
          status: 'fix [fx]',
          category: 'defect',
          completed: {
            an: '2025-12-15 09:00',
            fx: '2025-12-15 11:00',
          },
          children: [],
        },
      ];

      mockGetWorkflows.mockResolvedValue(mockWorkflows);
      mockGetWbsTree.mockResolvedValue({ metadata: mockMetadata, tree: mockTree });

      // Act: [fx] → [an] 롤백 실행
      const result = await executeTransition('TSK-DEFECT-01', 'start');

      // Assert
      expect(result.success).toBe(true);

      const savedTree = mockSaveWbsTree.mock.calls[0][2] as WbsNode[];
      const updatedNode = savedTree[0];

      // an 갱신됨
      expect(updatedNode.completed?.an).toBeDefined();
      expect(updatedNode.completed?.an).not.toBe('2025-12-15 09:00');

      // fx, vf, xx 삭제됨
      expect(updatedNode.completed?.fx).toBeUndefined();
      expect(updatedNode.completed?.vf).toBeUndefined();
      expect(updatedNode.completed?.xx).toBeUndefined();
    });
  });

  /**
   * UT-009: 롤백 경계 조건 (삭제할 completed 키 없음)
   * 롤백 대상 키가 completed에 없어도 에러 없이 진행되어야 함
   */
  describe('UT-009: 롤백 경계 조건', () => {
    it('should handle rollback when no completed keys to delete', async () => {
      // Arrange: development 워크플로우, [im] → [dd] 롤백
      // 기존 completed: { bd, dd } (im 없음)
      const mockWorkflows = createMockWorkflowsConfig(
        'development',
        ['[ ]', '[bd]', '[dd]', '[im]', '[vf]', '[xx]'],
        [{ from: '[im]', to: '[dd]', command: 'draft' }]
      );

      const mockMetadata: WbsMetadata = {
        version: '1.0',
        depth: 4,
        updated: '2025-12-15',
        start: '2025-12-01',
      };

      const mockTree: WbsNode[] = [
        {
          id: 'TSK-03-06',
          type: 'task',
          title: 'Test Task',
          status: 'implement [im]',
          category: 'development',
          completed: {
            bd: '2025-12-15 10:00',
            dd: '2025-12-15 12:00',
            // im 없음 (불완전한 데이터)
          },
          children: [],
        },
      ];

      mockGetWorkflows.mockResolvedValue(mockWorkflows);
      mockGetWbsTree.mockResolvedValue({ metadata: mockMetadata, tree: mockTree });

      // Act: [im] → [dd] 롤백 실행
      const result = await executeTransition('TSK-03-06', 'draft');

      // Assert: 에러 없이 실행 완료
      expect(result.success).toBe(true);

      const savedTree = mockSaveWbsTree.mock.calls[0][2] as WbsNode[];
      const updatedNode = savedTree[0];

      // 기존 항목 유지
      expect(updatedNode.completed?.bd).toBe('2025-12-15 10:00');

      // dd 갱신됨
      expect(updatedNode.completed?.dd).toBeDefined();
      expect(updatedNode.completed?.dd).not.toBe('2025-12-15 12:00');

      // im, vf, xx는 원래 없었으므로 여전히 없음
      expect(updatedNode.completed?.im).toBeUndefined();
      expect(updatedNode.completed?.vf).toBeUndefined();
      expect(updatedNode.completed?.xx).toBeUndefined();
    });

    it('should handle rollback when completed field is empty', async () => {
      // Arrange: completed 필드가 비어있는 경우
      const mockWorkflows = createMockWorkflowsConfig(
        'development',
        ['[ ]', '[bd]', '[dd]', '[im]', '[vf]', '[xx]'],
        [{ from: '[im]', to: '[dd]', command: 'draft' }]
      );

      const mockMetadata: WbsMetadata = {
        version: '1.0',
        depth: 4,
        updated: '2025-12-15',
        start: '2025-12-01',
      };

      const mockTree: WbsNode[] = [
        {
          id: 'TSK-03-06',
          type: 'task',
          title: 'Test Task',
          status: 'implement [im]',
          category: 'development',
          completed: {}, // 비어있음
          children: [],
        },
      ];

      mockGetWorkflows.mockResolvedValue(mockWorkflows);
      mockGetWbsTree.mockResolvedValue({ metadata: mockMetadata, tree: mockTree });

      // Act
      const result = await executeTransition('TSK-03-06', 'draft');

      // Assert: 에러 없이 실행 완료
      expect(result.success).toBe(true);

      const savedTree = mockSaveWbsTree.mock.calls[0][2] as WbsNode[];
      const updatedNode = savedTree[0];

      // dd만 추가됨
      expect(updatedNode.completed?.dd).toBeDefined();
      expect(Object.keys(updatedNode.completed || {}).length).toBe(1);
    });
  });
});
