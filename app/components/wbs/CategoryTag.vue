<template>
  <div :data-testid="`category-tag-${category}`" :style="{ backgroundColor: categoryColor }" class="category-tag-wrapper">
    <Tag
      :value="categoryLabel"
      :icon="categoryIcon"
      rounded
      :aria-label="`Category: ${categoryLabel}`"
    />
  </div>
</template>

<script setup lang="ts">
import Tag from 'primevue/tag'
import type { TaskCategory } from '~/types'

interface Props {
  category: TaskCategory
}

const props = defineProps<Props>()

interface CategoryConfig {
  icon: string
  color: string
  label: string
}

/**
 * 카테고리 → 아이콘/색상/레이블 매핑
 */
const categoryConfig = computed((): CategoryConfig => {
  const configs: Record<TaskCategory, CategoryConfig> = {
    development: { icon: 'pi-code', color: '#3b82f6', label: 'Dev' },
    defect: { icon: 'pi-exclamation-triangle', color: '#ef4444', label: 'Defect' },
    infrastructure: { icon: 'pi-cog', color: '#8b5cf6', label: 'Infra' }
  }
  return configs[props.category]
})

const categoryIcon = computed(() => `pi ${categoryConfig.value.icon}`)
const categoryColor = computed(() => categoryConfig.value.color)
const categoryLabel = computed(() => categoryConfig.value.label)
</script>

<style scoped>
.category-tag-wrapper {
  display: inline-block;
  border-radius: 12px;
}

/* PrimeVue Tag 스타일은 전역 테마에서 처리 */
</style>
