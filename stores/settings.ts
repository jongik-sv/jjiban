import { defineStore } from 'pinia';
import type { Column, CategoryConfig, WorkflowRule } from '~/types';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    columns: [] as Column[],
    categories: [] as CategoryConfig[],
    workflows: [] as WorkflowRule[],
    loaded: false,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getColumn: (state) => (columnId: string) => state.columns.find(c => c.id === columnId),
    getCategory: (state) => (categoryId: string) => state.categories.find(c => c.id === categoryId),
    getCategoryByCode: (state) => (code: string) => state.categories.find(c => c.code === code),
  },

  actions: {
    async loadSettings() {
      if (this.loaded) return;

      this.loading = true;
      this.error = null;

      try {
        const [columnsRes, categoriesRes, workflowsRes] = await Promise.all([
          $fetch<{ success: boolean; data: Column[] }>('/api/settings/columns'),
          $fetch<{ success: boolean; data: CategoryConfig[] }>('/api/settings/categories'),
          $fetch<{ success: boolean; data: WorkflowRule[] }>('/api/settings/workflows'),
        ]);

        if (columnsRes.success && columnsRes.data) {
          this.columns = columnsRes.data;
        }
        if (categoriesRes.success && categoriesRes.data) {
          this.categories = categoriesRes.data;
        }
        if (workflowsRes.success && workflowsRes.data) {
          this.workflows = workflowsRes.data;
        }

        this.loaded = true;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load settings';
      } finally {
        this.loading = false;
      }
    },

    getAvailableTransitions(category: string, currentStatus: string): WorkflowRule[] {
      return this.workflows.filter(
        w => w.category === category && w.from === currentStatus
      );
    },

    getColumnForStatus(status: string): Column | undefined {
      return this.columns.find(c => c.statuses.includes(status));
    },

    reloadSettings() {
      this.loaded = false;
      return this.loadSettings();
    },
  },
});
