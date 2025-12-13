import { defineStore } from 'pinia';
import type { WbsNode } from '~/types';

export const useWbsStore = defineStore('wbs', {
  state: () => ({
    root: null as WbsNode | null,
    expandedNodes: new Set<string>(),
    loading: false,
    error: null as string | null,
    searchQuery: '',
  }),

  getters: {
    wpCount: (state) => {
      if (!state.root) return 0;
      return state.root.children.filter(n => n.type === 'wp').length;
    },

    actCount: (state) => {
      if (!state.root) return 0;
      let count = 0;
      const countActs = (node: WbsNode) => {
        if (node.type === 'act') count++;
        node.children.forEach(countActs);
      };
      state.root.children.forEach(countActs);
      return count;
    },

    taskCount: (state) => {
      if (!state.root) return 0;
      let count = 0;
      const countTasks = (node: WbsNode) => {
        if (node.type === 'task') count++;
        node.children.forEach(countTasks);
      };
      state.root.children.forEach(countTasks);
      return count;
    },

    totalProgress: (state) => {
      return state.root?.progress ?? 0;
    },

    isExpanded: (state) => (nodeId: string) => state.expandedNodes.has(nodeId),

    filteredNodes: (state) => {
      if (!state.root || !state.searchQuery) return state.root;
      // TODO: 검색 필터링 로직 구현
      return state.root;
    },
  },

  actions: {
    async loadWbs(projectId: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch<{ success: boolean; data: WbsNode }>(`/api/projects/${projectId}/wbs`);
        if (response.success && response.data) {
          this.root = response.data;
          // 기본적으로 1레벨 노드 펼치기
          this.root.children.forEach(child => {
            this.expandedNodes.add(child.id);
          });
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load WBS';
      } finally {
        this.loading = false;
      }
    },

    toggleExpand(nodeId: string) {
      if (this.expandedNodes.has(nodeId)) {
        this.expandedNodes.delete(nodeId);
      } else {
        this.expandedNodes.add(nodeId);
      }
    },

    expandAll() {
      if (!this.root) return;
      const addAll = (node: WbsNode) => {
        this.expandedNodes.add(node.id);
        node.children.forEach(addAll);
      };
      this.root.children.forEach(addAll);
    },

    collapseAll() {
      this.expandedNodes.clear();
    },

    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    clearWbs() {
      this.root = null;
      this.expandedNodes.clear();
      this.searchQuery = '';
    },
  },
});
