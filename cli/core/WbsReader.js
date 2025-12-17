/**
 * WBS 리더
 * Task: TSK-07-01
 * 책임: wbs.md 파싱 및 Task 정보 조회
 *
 * Note: CLI 독립 실행을 위해 간단한 파서 내장
 */

import { promises as fs } from 'fs';
import { join } from 'path'
import { TaskNotFoundError, WbsNotFoundError } from '../errors/JjibanError.js';

/**
 * 간단한 WBS 파서 (CLI용)
 * Task 정보만 추출하는 경량 버전
 */
function parseWbsMarkdownSimple(markdown) {
  const nodes = [];
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');

  let inMetadata = true;

  for (const line of lines) {
    if (line.trim() === '---') {
      inMetadata = false;
      continue;
    }

    if (inMetadata) continue;

    // Task 헤더 파싱 (### TSK-XX-XX-XX: 또는 #### TSK-XX-XX-XX:)
    const taskMatch = line.match(/^#{2,4}\s+(TSK-\d{2}(?:-\d{2}){1,2}):\s*(.*)$/);
    if (taskMatch) {
      nodes.push({
        id: taskMatch[1],
        title: taskMatch[2].trim(),
        type: 'task',
        attributes: {}
      });
      continue;
    }

    // 속성 파싱 (- key: value)
    if (nodes.length > 0 && line.trim().startsWith('- ')) {
      const attrMatch = line.match(/^-\s*(\w+(?:-\w+)*):\s*(.*)$/);
      if (attrMatch) {
        const key = attrMatch[1];
        const value = attrMatch[2].trim();
        nodes[nodes.length - 1].attributes[key] = value;

        // 특정 속성은 노드에 직접 저장
        if (key === 'category') nodes[nodes.length - 1].category = value;
        if (key === 'status') nodes[nodes.length - 1].status = value;
        if (key === 'priority') nodes[nodes.length - 1].priority = value;
      }
    }
  }

  return nodes;
}

/**
 * WBS 파일에서 Task 정보 조회
 */
export class WbsReader {
  /**
   * @param {string} projectRoot - 프로젝트 루트 디렉토리
   */
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
  }

  /**
   * 모든 프로젝트 목록 조회
   * @returns {Promise<string[]>} 프로젝트 ID 배열
   */
  async getAllProjects() {
    const projectsDir = join(this.projectRoot, '.jjiban', 'projects');
    try {
      const entries = await fs.readdir(projectsDir, { withFileTypes: true });
      return entries.filter(e => e.isDirectory()).map(e => e.name);
    } catch {
      return [];
    }
  }

  /**
   * Task ID로 전체 프로젝트 검색
   * @param {string} taskId - Task ID
   * @returns {Promise<Array<{projectId: string, task: Object}>>} 발견된 프로젝트와 Task 정보
   */
  async searchTaskInAllProjects(taskId) {
    const projects = await this.getAllProjects();
    const results = [];

    for (const projectId of projects) {
      try {
        const nodes = await this.readWbs(projectId);
        const task = this.findTaskInList(nodes, taskId);
        if (task) {
          results.push({ projectId, task });
        }
      } catch { /* WBS 없으면 무시 */ }
    }

    return results;
  }

  /**
   * 프로젝트 ID 자동 탐지
   * @returns {Promise<string|null>} 프로젝트 ID
   */
  async detectProjectId() {
    const projectsPath = join(this.projectRoot, '.jjiban', 'settings', 'projects.json');

    try {
      const content = await fs.readFile(projectsPath, 'utf-8');
      const data = JSON.parse(content);

      if (data.defaultProject) {
        return data.defaultProject;
      }

      if (data.projects && data.projects.length > 0) {
        return data.projects[0].id;
      }

      return null;
    } catch {
      // projects.json 없으면 폴더에서 탐지
      const projectsDir = join(this.projectRoot, '.jjiban', 'projects');

      try {
        const entries = await fs.readdir(projectsDir, { withFileTypes: true });
        const projectDirs = entries.filter(e => e.isDirectory());

        if (projectDirs.length > 0) {
          return projectDirs[0].name;
        }
      } catch {
        return null;
      }

      return null;
    }
  }

  /**
   * WBS 파일 경로 가져오기
   * @param {string} projectId - 프로젝트 ID
   * @returns {string} wbs.md 경로
   */
  getWbsPath(projectId) {
    return join(this.projectRoot, '.jjiban', 'projects', projectId, 'wbs.md');
  }

  /**
   * WBS 파일 읽기 및 파싱
   * @param {string} projectId - 프로젝트 ID
   * @returns {Promise<Array>} WBS 트리
   * @throws {WbsNotFoundError} WBS 파일 없음
   */
  async readWbs(projectId) {
    const wbsPath = this.getWbsPath(projectId);

    try {
      const content = await fs.readFile(wbsPath, 'utf-8');
      return parseWbsMarkdownSimple(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new WbsNotFoundError(projectId);
      }
      throw error;
    }
  }

  /**
   * 리스트에서 Task 찾기
   * @param {Array} nodes - WBS 노드 배열 (flat)
   * @param {string} taskId - 찾을 Task ID
   * @returns {Object|null} Task 노드
   */
  findTaskInList(nodes, taskId) {
    return nodes.find(node => node.id === taskId && node.type === 'task') || null;
  }

  /**
   * Task 정보 조회
   * @param {string} taskId - Task ID
   * @param {string} [projectId] - 프로젝트 ID (생략 시 자동 탐지)
   * @returns {Promise<Object>} Task 정보
   * @throws {TaskNotFoundError} Task 없음
   * @throws {WbsNotFoundError} WBS 파일 없음
   */
  async getTask(taskId, projectId = null) {
    const pid = projectId || await this.detectProjectId();

    if (!pid) {
      throw new WbsNotFoundError('(unknown)');
    }

    const nodes = await this.readWbs(pid);
    const task = this.findTaskInList(nodes, taskId);

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    // 상태 코드 추출 (예: "basic-design [bd]" → "[bd]")
    const statusMatch = (task.status || '[ ]').match(/\[([^\]]*)\]/);
    const statusCode = statusMatch ? `[${statusMatch[1]}]` : '[ ]';

    return {
      id: task.id,
      title: task.title,
      category: task.category || 'development',
      status: statusCode,
      priority: task.priority,
      projectId: pid
    };
  }
}
