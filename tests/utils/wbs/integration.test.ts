/**
 * WBS Module Integration Test
 *
 * 통합 시나리오:
 * 1. Parser: wbs.md 파일 → WbsNode[] 트리
 * 2. Serializer: WbsNode[] 트리 → wbs.md 문자열
 * 3. Validator: WbsNode[] 트리 유효성 검증
 *
 * 라운드트립 테스트: Parse → Serialize → Parse again
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseWbsMarkdown } from '../../../server/utils/wbs/parser';
import { serializeWbs, calculateMaxDepth } from '../../../server/utils/wbs/serializer';
import { validateWbs } from '../../../server/utils/wbs/validation';
import type { WbsNode, WbsMetadata } from '../../../types';

describe('WBS Module Integration', () => {
  let realWbsContent: string;
  let parsedNodes: WbsNode[];

  beforeAll(() => {
    // 실제 프로젝트 wbs.md 파일 로드
    const wbsPath = join(process.cwd(), '.jjiban/projects/jjiban/wbs.md');
    realWbsContent = readFileSync(wbsPath, 'utf-8');
  });

  describe('Scenario 1: Parse Real WBS File', () => {
    it('should parse real wbs.md without errors', () => {
      parsedNodes = parseWbsMarkdown(realWbsContent);

      expect(parsedNodes).toBeDefined();
      expect(Array.isArray(parsedNodes)).toBe(true);
      expect(parsedNodes.length).toBeGreaterThan(0);
    });

    it('should parse all Work Packages (WP)', () => {
      const wpNodes = parsedNodes.filter(n => n.type === 'wp');

      // 실제 wbs.md에는 WP-01 ~ WP-08이 있음
      expect(wpNodes.length).toBe(8);
      expect(wpNodes.map(n => n.id)).toContain('WP-01');
      expect(wpNodes.map(n => n.id)).toContain('WP-02');
      expect(wpNodes.map(n => n.id)).toContain('WP-08');
    });

    it('should parse nested ACT and TSK nodes', () => {
      const wp01 = parsedNodes.find(n => n.id === 'WP-01');
      expect(wp01).toBeDefined();

      // WP-01 하위에 ACT가 있어야 함
      const actNodes = wp01!.children.filter(n => n.type === 'act');
      expect(actNodes.length).toBeGreaterThan(0);

      // ACT 하위에 TSK가 있어야 함
      const act0101 = actNodes.find(n => n.id === 'ACT-01-01');
      expect(act0101).toBeDefined();
      expect(act0101!.children.length).toBeGreaterThan(0);
      expect(act0101!.children[0].type).toBe('task');
    });

    it('should parse Task attributes correctly', () => {
      const wp01 = parsedNodes.find(n => n.id === 'WP-01');
      const act0101 = wp01!.children.find(n => n.id === 'ACT-01-01');
      const task010101 = act0101!.children.find(n => n.id === 'TSK-01-01-01');

      expect(task010101).toBeDefined();
      expect(task010101!.category).toBe('infrastructure');
      expect(task010101!.status).toBeDefined();
      expect(task010101!.priority).toBe('critical');
    });
  });

  describe('Scenario 2: Validate Parsed WBS', () => {
    it('should validate parsed WBS without errors', () => {
      const result = validateWbs(parsedNodes);

      // 유효한 WBS여야 함
      if (!result.isValid) {
        console.log('Validation errors:', result.errors);
      }
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate all node IDs', () => {
      const result = validateWbs(parsedNodes);

      // ID_FORMAT 에러가 없어야 함
      const idErrors = result.errors.filter(e => e.type === 'ID_FORMAT');
      expect(idErrors).toHaveLength(0);
    });

    it('should validate hierarchy relationships', () => {
      const result = validateWbs(parsedNodes);

      // HIERARCHY_MISMATCH 에러가 없어야 함
      const hierarchyErrors = result.errors.filter(e => e.type === 'HIERARCHY_MISMATCH');
      expect(hierarchyErrors).toHaveLength(0);
    });
  });

  describe('Scenario 3: Serialize and Re-parse (Round-trip)', () => {
    let serializedContent: string;
    let reParsedNodes: WbsNode[];

    it('should serialize parsed nodes to markdown', () => {
      const metadata: WbsMetadata = {
        version: '1.0',
        depth: calculateMaxDepth(parsedNodes) as 3 | 4,
        updated: '2025-12-14',
        start: '2025-12-13'
      };

      serializedContent = serializeWbs(parsedNodes, metadata, { updateDate: false });

      expect(serializedContent).toBeDefined();
      expect(typeof serializedContent).toBe('string');
      expect(serializedContent.length).toBeGreaterThan(0);
    });

    it('should re-parse serialized content successfully', () => {
      reParsedNodes = parseWbsMarkdown(serializedContent);

      expect(reParsedNodes).toBeDefined();
      expect(Array.isArray(reParsedNodes)).toBe(true);
    });

    it('should preserve WP count after round-trip', () => {
      const originalWpCount = parsedNodes.filter(n => n.type === 'wp').length;
      const reParsedWpCount = reParsedNodes.filter(n => n.type === 'wp').length;

      expect(reParsedWpCount).toBe(originalWpCount);
    });

    it('should preserve Task IDs after round-trip', () => {
      // 원본에서 모든 Task ID 수집
      const collectTaskIds = (nodes: WbsNode[]): string[] => {
        const ids: string[] = [];
        const traverse = (node: WbsNode) => {
          if (node.type === 'task') {
            ids.push(node.id);
          }
          node.children.forEach(traverse);
        };
        nodes.forEach(traverse);
        return ids;
      };

      const originalTaskIds = collectTaskIds(parsedNodes).sort();
      const reParsedTaskIds = collectTaskIds(reParsedNodes).sort();

      expect(reParsedTaskIds).toEqual(originalTaskIds);
    });

    it('should preserve critical Task attributes after round-trip', () => {
      // 원본 TSK-01-01-01 찾기
      const findTask = (nodes: WbsNode[], id: string): WbsNode | undefined => {
        for (const node of nodes) {
          if (node.id === id) return node;
          const found = findTask(node.children, id);
          if (found) return found;
        }
        return undefined;
      };

      const originalTask = findTask(parsedNodes, 'TSK-01-01-01');
      const reParsedTask = findTask(reParsedNodes, 'TSK-01-01-01');

      expect(reParsedTask).toBeDefined();
      expect(reParsedTask!.category).toBe(originalTask!.category);
      expect(reParsedTask!.priority).toBe(originalTask!.priority);
    });
  });

  describe('Scenario 4: Cross-module Validation', () => {
    it('should validate re-parsed nodes without errors', () => {
      const serializedContent = serializeWbs(parsedNodes, {
        version: '1.0',
        depth: 4,
        updated: '2025-12-14',
        start: '2025-12-13'
      });
      const reParsedNodes = parseWbsMarkdown(serializedContent);
      const result = validateWbs(reParsedNodes);

      if (!result.isValid) {
        console.log('Re-parsed validation errors:', result.errors);
      }
      expect(result.isValid).toBe(true);
    });

    it('should detect validation errors in corrupted data', () => {
      // 잘못된 데이터 생성 - Task에 category 누락
      const corruptedNodes: WbsNode[] = [
        {
          id: 'WP-01',
          type: 'wp',
          title: 'Test WP',
          children: [
            {
              id: 'ACT-01-01',
              type: 'act',
              title: 'Test ACT',
              children: [
                {
                  id: 'TSK-01-01-01',
                  type: 'task',
                  title: 'Test Task',
                  // category 누락
                  status: 'done [xx]',
                  priority: 'high',
                  children: []
                }
              ]
            }
          ]
        }
      ];

      const result = validateWbs(corruptedNodes);

      // 검증 결과 확인 - 에러가 있어야 함
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      // 에러가 category 관련인지 확인 (메시지에 category 포함)
      const hasAttributeError = result.errors.some(
        e => e.message.toLowerCase().includes('category') ||
             e.field === 'category'
      );
      expect(hasAttributeError).toBe(true);
    });
  });

  describe('Scenario 5: Performance', () => {
    it('should complete full pipeline within 100ms', () => {
      const start = performance.now();

      // Parse
      const nodes = parseWbsMarkdown(realWbsContent);

      // Validate
      validateWbs(nodes);

      // Serialize
      serializeWbs(nodes, {
        version: '1.0',
        depth: 4,
        updated: '2025-12-14',
        start: '2025-12-13'
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });
});
