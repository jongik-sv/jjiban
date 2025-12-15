/**
 * 프로젝트 스토어
 * 현재 프로젝트 정보 및 프로젝트 목록 관리
 * Task: TSK-01-01-03
 */

import type { Project, ProjectSummary, CreateProjectInput, ProjectListResponse } from '~/types/store'

export const useProjectStore = defineStore('project', () => {
  // ============================================================
  // State
  // ============================================================
  const currentProject = ref<Project | null>(null)
  const projects = ref<ProjectSummary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ============================================================
  // Getters
  // ============================================================
  const projectId = computed(() => currentProject.value?.id)
  const projectName = computed(() => currentProject.value?.name)
  const hasProject = computed(() => currentProject.value !== null)

  // ============================================================
  // Actions
  // ============================================================

  /**
   * 프로젝트 목록 조회
   */
  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ProjectListResponse>('/api/projects')
      projects.value = data.projects
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch projects'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 특정 프로젝트 로드
   */
  async function loadProject(id: string) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<Project>(`/api/projects/${id}`)
      currentProject.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load project'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 프로젝트 생성
   */
  async function createProject(input: CreateProjectInput) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<Project>('/api/projects', {
        method: 'POST',
        body: input
      })
      currentProject.value = data
      // 목록에도 추가 (ProjectSummary 타입에 맞게 필드 추가)
      projects.value.push({
        id: data.id,
        name: data.name,
        path: data.id,
        status: data.status,
        wbsDepth: 4,
        createdAt: data.createdAt
      })
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create project'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 현재 프로젝트 초기화
   */
  function clearProject() {
    currentProject.value = null
  }

  return {
    // State
    currentProject,
    projects,
    loading,
    error,
    // Getters
    projectId,
    projectName,
    hasProject,
    // Actions
    fetchProjects,
    loadProject,
    createProject,
    clearProject
  }
})

// HMR 지원
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProjectStore, import.meta.hot))
}
