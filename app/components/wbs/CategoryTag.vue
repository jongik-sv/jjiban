<template>
  <div
    :data-testid="`category-tag-${category}`"
    :class="`category-tag-${category}`"
    class="category-tag-wrapper"
  >
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
  label: string
}

/**
 * 카테고리 → 아이콘/레이블 매핑
 * CSS 클래스 중앙화: color 필드 제거, main.css에서 관리
 */
const categoryConfig = computed((): CategoryConfig => {
  const configs: Record<TaskCategory, CategoryConfig> = {
    development: { icon: 'pi-code', label: 'Dev' },
    defect: { icon: 'pi-exclamation-triangle', label: 'Defect' },
    infrastructure: { icon: 'pi-cog', label: 'Infra' }
  }

  const config = configs[props.category]
  if (!config) {
    console.warn(`Invalid category: ${props.category}`)
    return { icon: 'pi-code', label: 'Unknown' }
  }
  return config
})

const categoryIcon = computed(() => `pi ${categoryConfig.value.icon}`)
const categoryLabel = computed(() => categoryConfig.value.label)
</script>

<style scoped>
.category-tag-wrapper {
  display: inline-block;
  border-radius: 12px;
}

/* PrimeVue Tag 스타일은 전역 테마에서 처리 */
</style>
