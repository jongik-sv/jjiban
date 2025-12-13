import { defineStore } from 'pinia';
import type { Project } from '~/types';

export const useProjectStore = defineStore('project', {
  state: () => ({
    current: null as Project | null,
    projects: [] as Project[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    currentProjectId: (state) => state.current?.id,
    hasProject: (state) => state.current !== null,
    activeProjects: (state) => state.projects.filter(p => p.status === 'active'),
  },

  actions: {
    async loadProjects() {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch<{ success: boolean; data: Project[] }>('/api/projects');
        if (response.success && response.data) {
          this.projects = response.data;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load projects';
      } finally {
        this.loading = false;
      }
    },

    async selectProject(projectId: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch<{ success: boolean; data: Project }>(`/api/projects/${projectId}`);
        if (response.success && response.data) {
          this.current = response.data;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to select project';
      } finally {
        this.loading = false;
      }
    },

    clearCurrentProject() {
      this.current = null;
    },
  },
});
