/**
 * WBS Parser - 메인 파싱 함수
 * Task: TSK-02-02-01
 * 상세설계: 020-detail-design.md 섹션 3.1
 *
 * wbs.md 마크다운 파일을 파싱하여 WbsNode[] 트리로 변환
 */

import type { WbsNode } from '../../../../types';
import type { FlatNode } from './types';
import { parseNodeHeader } from './header';
import { parseNodeAttributes } from './attributes';
import { buildTree, calculateProgress } from './tree';

// Note: parseNodeHeader, parseNodeAttributes, buildTree 등은
// Nuxt가 각 파일에서 직접 auto-import

/**
 * wbs.md 전체 텍스트를 WbsNode[] 트리로 변환
 *
 * @param markdown - wbs.md 파일 내용
 * @returns 루트 노드 배열 (WbsNode[])
 *
 * FR-005: 메인 파싱 흐름 조정
 * FR-001: Markdown 헤더 파싱
 * FR-002: 속성 파싱
 * FR-003: 계층 구조 빌드
 * FR-004: 진행률 자동 계산
 */
export function parseWbsMarkdown(markdown: string): WbsNode[] {
  // 빈 문자열 처리
  if (!markdown || !markdown.trim()) {
    return [];
  }

  // CRLF를 LF로 정규화 (Windows 호환성)
  const normalizedMarkdown = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedMarkdown.split('\n');
  const flatNodes: FlatNode[] = [];
  let currentNode: FlatNode | null = null;
  let currentAttributeLines: string[] = [];
  let inMetadata = true;

  for (const line of lines) {
    // 메타데이터 섹션 스킵
    if (line.trim() === '---') {
      inMetadata = false;
      continue;
    }

    if (inMetadata) {
      continue;
    }

    // 빈 라인 처리
    if (!line.trim()) {
      continue;
    }

    // 헤더 라인 체크
    const header = parseNodeHeader(line);

    if (header) {
      // 이전 노드가 있으면 저장
      if (currentNode) {
        currentNode.attributes = parseNodeAttributes(currentAttributeLines);
        flatNodes.push(currentNode);
      }

      // 새 노드 시작
      currentNode = {
        id: header.id,
        type: header.type,
        title: header.title,
        level: header.level,
        attributes: {},
      };
      currentAttributeLines = [];
    } else if (currentNode) {
      // 속성 라인 수집
      currentAttributeLines.push(line);
    }
  }

  // 마지막 노드 저장
  if (currentNode) {
    currentNode.attributes = parseNodeAttributes(currentAttributeLines);
    flatNodes.push(currentNode);
  }

  // 트리 빌드
  const tree = buildTree(flatNodes);

  // 진행률 계산
  calculateProgress(tree);

  return tree;
}
