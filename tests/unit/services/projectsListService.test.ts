/**
 * ProjectsListService Unit Tests
 *
 * @see TSK-02-03-03
 * @see 026-test-specification.md
 *
 * Test Coverage:
 * - UT-001: getProjectsList 정상 조회
 * - UT-009: setDefaultProject 유효하지 않은 ID
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as projectsListService from '../../../server/utils/projects/projectsListService';
import * as paths from '../../../server/utils/projects/paths';

// Mock fs/promises
vi.mock('fs/promises');

// Mock paths module
vi.mock('../../../server/utils/projects/paths', () => ({
  getProjectsListFilePath: vi.fn(() => '/test/.jjiban/settings/projects.json'),
  getBasePath: vi.fn(() => '/test'),
}));

describe('ProjectsListService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProjectsList', () => {
    /**
     * UT-001: ProjectsListService.getList 정상 조회
     * @requirement FR-001
     */
    it('UT-001: should return project list with default config', async () => {
      // Arrange: Mock 데이터 설정
      const mockProjectsConfig = {
        version: '1.0',
        projects: [
          {
            id: 'test-project',
            name: '테스트 프로젝트',
            path: 'test-project',
            status: 'active',
            wbsDepth: 4,
            createdAt: '2025-01-01',
          },
          {
            id: 'archived-project',
            name: '아카이브 프로젝트',
            path: 'archived-project',
            status: 'archived',
            wbsDepth: 3,
            createdAt: '2024-06-01',
          },
        ],
        defaultProject: 'test-project',
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockProjectsConfig));

      // Act: 프로젝트 목록 조회
      const result = await projectsListService.getProjectsList();

      // Assert: 응답 검증
      expect(result).toHaveProperty('projects');
      expect(result).toHaveProperty('defaultProject');
      expect(result.projects).toHaveLength(2);
      expect(result.defaultProject).toBe('test-project');
      expect(result.projects[0].id).toBe('test-project');
    });

    it('UT-001a: should return empty list when no projects.json exists', async () => {
      // Arrange: 파일 없음 시뮬레이션
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      vi.mocked(fs.readFile).mockRejectedValue(error);

      // Act
      const result = await projectsListService.getProjectsList();

      // Assert: 기본값 반환
      expect(result.projects).toEqual([]);
      expect(result.defaultProject).toBeNull();
    });

    it('UT-001b: should filter by status when statusFilter is provided', async () => {
      // Arrange
      const mockProjectsConfig = {
        version: '1.0',
        projects: [
          { id: 'active-1', name: 'Active 1', path: 'active-1', status: 'active', wbsDepth: 4, createdAt: '2025-01-01' },
          { id: 'archived-1', name: 'Archived 1', path: 'archived-1', status: 'archived', wbsDepth: 3, createdAt: '2024-06-01' },
        ],
        defaultProject: 'active-1',
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockProjectsConfig));

      // Act: active 필터
      const result = await projectsListService.getProjectsList('active');

      // Assert
      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].status).toBe('active');
    });
  });

  describe('isProjectIdDuplicate', () => {
    it('should return true for existing project ID', async () => {
      // Arrange
      const mockConfig = {
        version: '1.0',
        projects: [{ id: 'existing-project', name: 'Existing', path: 'existing-project', status: 'active', wbsDepth: 4, createdAt: '2025-01-01' }],
        defaultProject: null,
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      // Act
      const result = await projectsListService.isProjectIdDuplicate('existing-project');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for non-existing project ID', async () => {
      // Arrange
      const mockConfig = {
        version: '1.0',
        projects: [],
        defaultProject: null,
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      // Act
      const result = await projectsListService.isProjectIdDuplicate('new-project');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('addProjectToList', () => {
    it('should add project to list successfully', async () => {
      // Arrange
      const mockConfig = {
        version: '1.0',
        projects: [],
        defaultProject: null,
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      const newProject = {
        id: 'new-project',
        name: '새 프로젝트',
        path: 'new-project',
        status: 'active' as const,
        wbsDepth: 4 as const,
        createdAt: '2025-01-01',
      };

      // Act & Assert: 에러 없이 완료
      await expect(projectsListService.addProjectToList(newProject)).resolves.not.toThrow();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should throw error on duplicate project ID', async () => {
      // Arrange
      const mockConfig = {
        version: '1.0',
        projects: [{ id: 'existing', name: 'Existing', path: 'existing', status: 'active', wbsDepth: 4, createdAt: '2025-01-01' }],
        defaultProject: null,
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      const duplicateProject = {
        id: 'existing',
        name: 'Duplicate',
        path: 'existing',
        status: 'active' as const,
        wbsDepth: 4 as const,
        createdAt: '2025-01-01',
      };

      // Act & Assert
      await expect(projectsListService.addProjectToList(duplicateProject)).rejects.toThrow();
    });
  });

  describe('setDefaultProject', () => {
    /**
     * UT-009: ProjectsListService.setDefault 유효하지 않은 ID
     * @requirement BR-005
     */
    it('UT-009: should throw on invalid (non-existent) project ID', async () => {
      // Arrange
      const mockConfig = {
        version: '1.0',
        projects: [{ id: 'existing', name: 'Existing', path: 'existing', status: 'active', wbsDepth: 4, createdAt: '2025-01-01' }],
        defaultProject: null,
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      // Act & Assert: 존재하지 않는 프로젝트 ID로 설정 시도
      await expect(projectsListService.setDefaultProject('non-existent')).rejects.toThrow();
    });

    it('should set default project successfully for valid ID', async () => {
      // Arrange
      const mockConfig = {
        version: '1.0',
        projects: [{ id: 'valid-project', name: 'Valid', path: 'valid-project', status: 'active', wbsDepth: 4, createdAt: '2025-01-01' }],
        defaultProject: null,
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      // Act & Assert
      await expect(projectsListService.setDefaultProject('valid-project')).resolves.not.toThrow();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should allow setting default to null', async () => {
      // Arrange
      const mockConfig = {
        version: '1.0',
        projects: [],
        defaultProject: 'some-project',
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      // Act & Assert
      await expect(projectsListService.setDefaultProject(null)).resolves.not.toThrow();
    });
  });
});
