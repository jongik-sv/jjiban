<script setup lang="ts">
/**
 * WbsTreeHeader 컴포넌트
 * WBS 트리 패널의 헤더 UI
 * - 타이틀 표시
 * - 검색 박스 통합
 * - 요약 카드 통합
 * - 전체 펼치기/접기 버튼
 *
 * @see TSK-04-01
 * @see 020-detail-design.md
 */

import { useWbsStore } from '~/stores/wbs'
import Button from 'primevue/button'
import WbsSearchBox from './WbsSearchBox.vue'
import WbsSummaryCards from './WbsSummaryCards.vue'

const wbsStore = useWbsStore()

// 액션 핸들러
const handleExpandAll = () => {
  wbsStore.expandAll()
}

const handleCollapseAll = () => {
  wbsStore.collapseAll()
}
</script>

<template>
  <div
    data-testid="wbs-tree-header"
    class="wbs-tree-header bg-bg-header border-b border-border p-4"
  >
    <!-- 타이틀 및 액션 버튼 -->
    <div class="flex items-center justify-between mb-4">
      <!-- 타이틀 -->
      <h2
        id="wbs-tree-title"
        class="text-lg font-semibold text-text flex items-center gap-2"
      >
        <i class="pi pi-sitemap text-purple-500"></i>
        WBS 트리
      </h2>

      <!-- 액션 버튼 -->
      <div class="flex gap-2">
        <Button
          data-testid="expand-all-button"
          label="전체 펼치기"
          icon="pi pi-angle-double-down"
          size="small"
          severity="secondary"
          outlined
          @click="handleExpandAll"
          aria-label="Expand all tree nodes"
          aria-describedby="wbs-tree-title"
        />
        <Button
          data-testid="collapse-all-button"
          label="전체 접기"
          icon="pi pi-angle-double-up"
          size="small"
          severity="secondary"
          outlined
          @click="handleCollapseAll"
          aria-label="Collapse all tree nodes"
          aria-describedby="wbs-tree-title"
        />
      </div>
    </div>

    <!-- 검색 박스 -->
    <WbsSearchBox class="mb-4" />

    <!-- 요약 카드 -->
    <WbsSummaryCards />
  </div>
</template>
