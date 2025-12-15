<script setup lang="ts">
/**
 * WBS 페이지
 * - WBS Tree + Task Detail 패널 표시
 * - AppLayout + AppHeader 사용
 *
 * @see TSK-01-02-01
 * @see TSK-01-02-02
 */

// 페이지 메타데이터
definePageMeta({
  layout: 'default'
})

// 페이지 제목
useHead({
  title: 'WBS - jjiban'
})

// 프로젝트 스토어
const projectStore = useProjectStore()
</script>

<template>
  <LayoutAppLayout>
    <!-- Header Slot: AppHeader 컴포넌트 사용 -->
    <template #header>
      <LayoutAppHeader :project-name="projectStore.projectName || ''" />
    </template>

    <!-- Left Panel: WBS Tree Panel -->
    <template #left>
      <WbsTreePanel />
    </template>

    <!-- Right Panel: Task Detail (향후 WP-05에서 구현) -->
    <template #right>
      <div class="p-4">
        <div class="card">
          <h3 class="text-lg font-semibold text-text mb-4">Task Detail</h3>
          <p class="text-text-secondary text-sm">
            선택된 Task의 상세 정보가 여기에 표시됩니다.
          </p>
          <p class="text-text-muted text-xs mt-2">
            (WP-05에서 구현 예정)
          </p>
        </div>
      </div>
    </template>
  </LayoutAppLayout>
</template>
