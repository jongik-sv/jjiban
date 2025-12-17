/**
 * 의존관계 그래프 타입 정의
 * Task: TSK-06-01
 */

import type { DataSet } from 'vis-data'

// vis-network 노드 타입
export interface GraphNode {
  id: string              // Task ID (예: "TSK-06-01")
  label: string           // 노드 라벨 (줄바꿈 포함)
  title?: string          // 호버 툴팁 (HTML)
  group: string           // 카테고리 (색상 그룹)
  level?: number          // 위상정렬 레벨 (LR 배치)
  color?: {
    background?: string
    border?: string
  }
  font?: {
    color?: string
    size?: number
  }
}

// vis-network 엣지 타입
export interface GraphEdge {
  id: string              // 엣지 고유 ID
  from: string            // 출발 노드 ID (의존 대상)
  to: string              // 도착 노드 ID (현재 Task)
  arrows?: string         // 화살표 방향
  color?: {
    color?: string
    highlight?: string
    hover?: string
  }
}

// 그래프 전체 데이터
export interface GraphData {
  nodes: DataSet<GraphNode>
  edges: DataSet<GraphEdge>
}

// 필터링 옵션
export interface GraphFilter {
  categories: string[]    // 선택된 카테고리
  statuses: string[]      // 선택된 상태
}

// vis-network Layout 옵션
export interface GraphLayoutOptions {
  hierarchical: {
    enabled: boolean
    direction: 'LR' | 'RL' | 'UD' | 'DU'
    sortMethod: 'directed' | 'hubsize'
    levelSeparation: number
    nodeSpacing: number
    treeSpacing: number
    blockShifting: boolean
    edgeMinimization: boolean
    parentCentralization: boolean
  }
}

// vis-network Interaction 옵션
export interface GraphInteractionOptions {
  dragNodes: boolean
  dragView: boolean
  zoomView: boolean
  hover: boolean
  tooltipDelay: number
  multiselect: boolean
  navigationButtons: boolean
  keyboard: {
    enabled: boolean
  }
}

// vis-network 전체 옵션
export interface GraphOptions {
  layout: GraphLayoutOptions
  physics: {
    enabled: boolean
  }
  interaction: GraphInteractionOptions
  nodes: {
    shape: string
    margin: number
    font: {
      size: number
      face: string
      color: string
    }
    borderWidth: number
    shadow: boolean
  }
  edges: {
    arrows: {
      to: {
        enabled: boolean
        scaleFactor: number
      }
    }
    smooth: {
      type: string
      forceDirection: string
    }
    color: {
      color: string
      highlight: string
      hover: string
    }
    width: number
  }
  groups: Record<string, {
    color: {
      background: string
      border: string
    }
  }>
}

// 카테고리별 색상 정의
export const GRAPH_COLORS = {
  development: {
    background: '#3b82f6',
    border: '#2563eb'
  },
  defect: {
    background: '#ef4444',
    border: '#dc2626'
  },
  infrastructure: {
    background: '#22c55e',
    border: '#16a34a'
  }
} as const

// 기본 그래프 옵션
export const DEFAULT_GRAPH_OPTIONS: GraphOptions = {
  layout: {
    hierarchical: {
      enabled: true,
      direction: 'LR',
      sortMethod: 'directed',
      levelSeparation: 200,
      nodeSpacing: 100,
      treeSpacing: 200,
      blockShifting: true,
      edgeMinimization: true,
      parentCentralization: true
    }
  },
  physics: {
    enabled: false
  },
  interaction: {
    dragNodes: true,
    dragView: true,
    zoomView: true,
    hover: true,
    tooltipDelay: 200,
    multiselect: false,
    navigationButtons: false,
    keyboard: {
      enabled: true
    }
  },
  nodes: {
    shape: 'box',
    margin: 10,
    font: {
      size: 12,
      face: 'Pretendard, sans-serif',
      color: '#e5e7eb'
    },
    borderWidth: 2,
    shadow: true
  },
  edges: {
    arrows: {
      to: {
        enabled: true,
        scaleFactor: 0.8
      }
    },
    smooth: {
      type: 'cubicBezier',
      forceDirection: 'horizontal'
    },
    color: {
      color: '#6c9bcf',
      highlight: '#3b82f6',
      hover: '#93c5fd'
    },
    width: 2
  },
  groups: {
    development: {
      color: GRAPH_COLORS.development
    },
    defect: {
      color: GRAPH_COLORS.defect
    },
    infrastructure: {
      color: GRAPH_COLORS.infrastructure
    }
  }
}
