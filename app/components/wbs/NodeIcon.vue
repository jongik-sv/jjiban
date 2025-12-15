<template>
  <div
    class="node-icon"
    :class="`node-icon-${type}`"
    :style="{ backgroundColor: iconColor }"
    :data-testid="`node-icon-${type}`"
  >
    <i :class="`pi ${iconClass}`" />
  </div>
</template>

<script setup lang="ts">
import type { WbsNodeType } from '~/types'

interface Props {
  type: WbsNodeType
}

const props = defineProps<Props>()

interface IconConfig {
  icon: string
  color: string
  label: string
}

const iconConfig = computed((): IconConfig => {
  const configs: Record<WbsNodeType, IconConfig> = {
    project: { icon: 'pi-folder', color: '#6366f1', label: 'P' },
    wp: { icon: 'pi-briefcase', color: '#3b82f6', label: 'WP' },
    act: { icon: 'pi-list', color: '#10b981', label: 'ACT' },
    task: { icon: 'pi-check-square', color: '#f59e0b', label: 'TSK' }
  }
  return configs[props.type]
})

const iconClass = computed(() => iconConfig.value.icon)
const iconColor = computed(() => iconConfig.value.color)
</script>

<style scoped>
.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@media (max-width: 767px) {
  .node-icon {
    width: 20px;
    height: 20px;
    font-size: 12px;
  }
}
</style>
