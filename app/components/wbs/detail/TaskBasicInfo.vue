<template>
  <Panel header="기본 정보" data-testid="task-basic-info-panel" class="task-basic-info">
    <div class="space-y-4">
      <!-- Task ID -->
      <div class="field">
        <label class="font-semibold text-sm text-gray-600">Task ID</label>
        <div class="mt-1">
          <Badge
            :value="task.id"
            data-testid="task-id-badge"
            severity="info"
            class="text-sm"
          />
        </div>
      </div>

      <!-- 제목 (인라인 편집) -->
      <div class="field">
        <label class="font-semibold text-sm text-gray-600">제목</label>
        <div class="mt-1">
          <!-- 편집 모드 -->
          <InputText
            v-if="isEditingTitle"
            ref="titleInputRef"
            v-model="editedTitle"
            data-testid="task-title-input"
            aria-label="Task 제목 편집"
            class="w-full"
            :disabled="props.updating"
            @keydown.enter="saveTitle"
            @keydown.escape="cancelEditTitle"
            @blur="saveTitle"
          />
          <!-- 표시 모드 -->
          <div
            v-else
            data-testid="task-title-display"
            class="cursor-pointer hover:bg-gray-100 p-2 rounded"
            @click="startEditTitle"
          >
            {{ task.title }}
          </div>
        </div>
      </div>

      <!-- 카테고리 (읽기 전용) -->
      <div class="field">
        <label class="font-semibold text-sm text-gray-600">카테고리</label>
        <div class="mt-1">
          <Tag
            :value="categoryLabel"
            :class="categoryClass"
            data-testid="task-category-tag"
          />
        </div>
      </div>

      <!-- 우선순위 (Dropdown) -->
      <div class="field">
        <label class="font-semibold text-sm text-gray-600">우선순위</label>
        <div class="mt-1">
          <Dropdown
            :model-value="task.priority"
            :options="priorityOptions"
            option-label="label"
            option-value="value"
            data-testid="task-priority-dropdown"
            aria-label="우선순위 선택"
            :disabled="props.updating"
            class="w-full"
            @update:model-value="handlePriorityChange"
          >
            <template #value="{ value }">
              <div :class="getPriorityClass(value)">
                {{ getPriorityLabel(value) }}
              </div>
            </template>
            <template #option="{ option }">
              <div
                :class="getPriorityClass(option.value)"
                :data-testid="`priority-option-${option.value}`"
              >
                {{ option.label }}
              </div>
            </template>
          </Dropdown>
        </div>
      </div>

      <!-- 담당자 (Dropdown) -->
      <div class="field">
        <label class="font-semibold text-sm text-gray-600">담당자</label>
        <div class="mt-1">
          <Dropdown
            :model-value="task.assignee?.id || null"
            :options="teamMemberOptions"
            option-label="name"
            option-value="id"
            placeholder="담당자 선택"
            data-testid="task-assignee-dropdown"
            aria-label="담당자 선택"
            :disabled="props.updating || loadingTeam"
            class="w-full"
            @update:model-value="handleAssigneeChange"
          >
            <template #value="{ value }">
              <div v-if="value" class="flex items-center gap-2">
                <Avatar
                  v-if="getTeamMemberById(value)?.avatar"
                  :image="getTeamMemberById(value)?.avatar"
                  shape="circle"
                  size="small"
                />
                <Avatar
                  v-else
                  :label="getTeamMemberById(value)?.name?.charAt(0)"
                  shape="circle"
                  size="small"
                />
                <span>{{ getTeamMemberById(value)?.name }}</span>
              </div>
              <span v-else class="text-gray-400">담당자 선택</span>
            </template>
            <template #option="{ option }">
              <div
                class="flex items-center gap-2"
                :data-testid="`assignee-option-${option.id}`"
              >
                <Avatar
                  v-if="option.avatar"
                  :image="option.avatar"
                  shape="circle"
                  size="small"
                />
                <Avatar
                  v-else
                  :label="option.name?.charAt(0)"
                  shape="circle"
                  size="small"
                />
                <span>{{ option.name }}</span>
              </div>
            </template>
          </Dropdown>
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
/**
 * TaskBasicInfo - Task 기본 정보 표시 및 인라인 편집
 * Task: TSK-05-01
 * 상세설계: 020-detail-design.md 섹션 9.3
 *
 * 책임:
 * - ID, 제목, 카테고리, 우선순위, 담당자 렌더링
 * - 제목 인라인 편집 UI
 * - 카테고리/우선순위별 색상 적용
 * - 편집 이벤트 Emit
 */

import type { TaskDetail, Priority, TeamMember } from '~/types'

// ============================================================
// Props & Emits
// ============================================================
interface Props {
  task: TaskDetail
  updating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  updating: false,
})

const emit = defineEmits<{
  'update:title': [title: string]
  'update:priority': [priority: Priority]
  'update:assignee': [assigneeId: string | null]
}>()

// ============================================================
// Stores
// ============================================================
const projectStore = useProjectStore()

// ============================================================
// State
// ============================================================
const isEditingTitle = ref(false)
const editedTitle = ref('')
const loadingTeam = ref(false)
const titleInputRef = ref<InstanceType<typeof InputText> | null>(null)

// ============================================================
// Computed
// ============================================================

/**
 * 카테고리 라벨
 */
const categoryLabel = computed(() => {
  const labels: Record<string, string> = {
    development: '개발',
    defect: '결함',
    infrastructure: '인프라',
  }
  return labels[props.task.category] || props.task.category
})

/**
 * 카테고리 색상 클래스 (FR-006)
 */
const categoryClass = computed(() => {
  const classes: Record<string, string> = {
    development: 'bg-blue-500 text-white',
    defect: 'bg-red-500 text-white',
    infrastructure: 'bg-green-500 text-white',
  }
  return classes[props.task.category] || 'bg-gray-500 text-white'
})

/**
 * 우선순위 옵션 (BR-002)
 */
const priorityOptions = computed(() => [
  { label: '긴급', value: 'critical' },
  { label: '높음', value: 'high' },
  { label: '보통', value: 'medium' },
  { label: '낮음', value: 'low' },
])

/**
 * 팀원 목록 옵션 (MAJ-002)
 */
const teamMemberOptions = computed(() => {
  return projectStore.teamMembers || []
})

// ============================================================
// Methods
// ============================================================

/**
 * 우선순위 라벨 반환
 */
function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    critical: '긴급',
    high: '높음',
    medium: '보통',
    low: '낮음',
  }
  return labels[priority] || priority
}

/**
 * 우선순위 색상 클래스 (FR-007)
 */
function getPriorityClass(priority: Priority): string {
  const classes: Record<Priority, string> = {
    critical: 'text-red-600 font-semibold',
    high: 'text-amber-600 font-semibold',
    medium: 'text-blue-600',
    low: 'text-gray-600',
  }
  return classes[priority] || 'text-gray-600'
}

/**
 * 팀원 ID로 TeamMember 찾기
 */
function getTeamMemberById(memberId: string): TeamMember | undefined {
  return teamMemberOptions.value.find((m: TeamMember) => m.id === memberId)
}

/**
 * 제목 편집 시작
 * CRT-001 수정: DOM 직접 조작 대신 Vue template ref 사용
 */
function startEditTitle() {
  if (props.updating) return
  isEditingTitle.value = true
  editedTitle.value = props.task.title
  // nextTick으로 InputText 렌더링 후 포커스 (Vue template ref 사용)
  nextTick(() => {
    // PrimeVue InputText의 $el 또는 내부 input 요소에 포커스
    const inputComponent = titleInputRef.value
    if (inputComponent?.$el) {
      const inputEl = inputComponent.$el.querySelector('input') || inputComponent.$el
      inputEl?.focus()
    }
  })
}

/**
 * 제목 편집 저장 (Enter/Blur)
 */
function saveTitle() {
  if (!isEditingTitle.value) return
  if (editedTitle.value !== props.task.title) {
    emit('update:title', editedTitle.value)
  }
  isEditingTitle.value = false
}

/**
 * 제목 편집 취소 (Escape)
 */
function cancelEditTitle() {
  isEditingTitle.value = false
  editedTitle.value = props.task.title
}

/**
 * 우선순위 변경 핸들러
 */
function handlePriorityChange(newPriority: Priority) {
  emit('update:priority', newPriority)
}

/**
 * 담당자 변경 핸들러
 */
function handleAssigneeChange(assigneeId: string | null) {
  emit('update:assignee', assigneeId)
}

/**
 * 팀원 목록 로드 (MAJ-002)
 */
async function loadTeamMembers() {
  if (projectStore.currentProject) return // 이미 로드됨

  loadingTeam.value = true
  try {
    // 프로젝트 ID는 URL 쿼리 또는 전역 상태에서 가져와야 함
    // 여기서는 'jjiban'으로 하드코딩 (실제로는 route.query.project 사용)
    const route = useRoute()
    const projectId = (route.query.project as string) || 'jjiban'
    await projectStore.loadProject(projectId)
  } catch (error) {
    console.error('[TaskBasicInfo] 팀원 목록 로드 실패:', error)
  } finally {
    loadingTeam.value = false
  }
}

// ============================================================
// Lifecycle
// ============================================================
onMounted(() => {
  loadTeamMembers()
})
</script>

<style scoped>
.task-basic-info .field {
  margin-bottom: 1rem;
}

.task-basic-info .field:last-child {
  margin-bottom: 0;
}
</style>
