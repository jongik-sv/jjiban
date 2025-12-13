import { defineStore } from 'pinia';
import type { WbsNode, TaskDetail } from '~/types';

export const useSelectionStore = defineStore('selection', {
  state: () => ({
    selectedNode: null as WbsNode | null,
    selectedTaskDetail: null as TaskDetail | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    hasSelection: (state) => state.selectedNode !== null,
    isTask: (state) => state.selectedNode?.type === 'task',
    isWp: (state) => state.selectedNode?.type === 'wp',
    isAct: (state) => state.selectedNode?.type === 'act',
    selectedId: (state) => state.selectedNode?.id,
  },

  actions: {
    async selectNode(node: WbsNode) {
      this.selectedNode = node;

      if (node.type === 'task') {
        await this.loadTaskDetail(node.id);
      } else {
        this.selectedTaskDetail = null;
      }
    },

    async loadTaskDetail(taskId: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch<{ success: boolean; data: TaskDetail }>(`/api/tasks/${taskId}`);
        if (response.success && response.data) {
          this.selectedTaskDetail = response.data;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load task detail';
      } finally {
        this.loading = false;
      }
    },

    clearSelection() {
      this.selectedNode = null;
      this.selectedTaskDetail = null;
      this.error = null;
    },
  },
});
