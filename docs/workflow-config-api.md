# Workflow Configuration API Reference

Quick reference for using the workflow configuration system.

## Import

```typescript
import { useWorkflowConfig } from '~/composables/useWorkflowConfig'
```

## Basic Usage

```typescript
const {
  config,                      // Raw configuration object
  getStateInfo,               // Get state metadata
  getCommandInfo,             // Get command metadata
  getWorkflowSteps,           // Get ordered workflow steps
  getStateActions,            // Get actions for state
  getAvailableTransitions,    // Get valid transitions
  getStatusSeverity,          // Get PrimeVue severity
  getStatusLabel,             // Get Korean label
  getStatusIcon,              // Get PrimeIcons class
  getProgressWeight,          // Get progress weight
  isCompleted,                // Check if done
  isTodo,                     // Check if todo
  isInProgress,               // Check if in progress
} = useWorkflowConfig()
```

## Common Patterns

### Display Workflow Steps

```vue
<script setup>
const workflowConfig = useWorkflowConfig()
const props = defineProps<{ category: TaskCategory }>()

const steps = computed(() =>
  workflowConfig.getWorkflowSteps(props.category)
)
</script>

<template>
  <div v-for="step in steps" :key="step.code">
    <i :class="step.icon"></i>
    {{ step.label }}
  </div>
</template>
```

### Render Status Badge

```vue
<script setup>
const workflowConfig = useWorkflowConfig()
const props = defineProps<{ status: string }>()

const severity = computed(() =>
  workflowConfig.getStatusSeverity(props.status)
)
const label = computed(() =>
  workflowConfig.getStatusLabel(props.status)
)
</script>

<template>
  <Badge :severity="severity" :value="label" />
</template>
```

### Show Available Actions

```vue
<script setup>
const workflowConfig = useWorkflowConfig()
const props = defineProps<{
  category: TaskCategory
  status: string
}>()

const actions = computed(() =>
  workflowConfig.getStateActions(props.category, props.status)
)

const transitions = computed(() =>
  workflowConfig.getAvailableTransitions(props.category, props.status)
)

const allCommands = computed(() => [
  ...transitions.value,
  ...actions.value
])
</script>

<template>
  <Button
    v-for="cmd in allCommands"
    :key="cmd.command"
    :label="cmd.label"
    :icon="cmd.icon"
    :severity="cmd.severity"
  />
</template>
```

### Calculate Progress

```typescript
const workflowConfig = useWorkflowConfig()

function calculateProgress(status: string): number {
  return workflowConfig.getProgressWeight(status)
}

function isTaskDone(status: string): boolean {
  return workflowConfig.isCompleted(status)
}

function getTaskPhase(status: string): 'todo' | 'inProgress' | 'completed' {
  if (workflowConfig.isTodo(status)) return 'todo'
  if (workflowConfig.isCompleted(status)) return 'completed'
  return 'inProgress'
}
```

## API Methods

### getStateInfo(code: string)

Get complete state configuration.

```typescript
const state = getStateInfo('[bd]')
// {
//   id: 'basic-design',
//   label: '기본설계',
//   labelEn: 'Basic Design',
//   icon: 'pi-pencil',
//   color: '#3b82f6',
//   severity: 'info',
//   progressWeight: 20
// }
```

### getCommandInfo(cmd: string)

Get complete command configuration.

```typescript
const command = getCommandInfo('start')
// {
//   label: '시작',
//   labelEn: 'Start',
//   icon: 'pi-play',
//   severity: 'primary',
//   isAction: false
// }
```

### getWorkflowSteps(category: TaskCategory)

Get ordered workflow steps for category.

```typescript
const steps = getWorkflowSteps('development')
// [
//   { code: '[ ]', label: '시작 전', labelEn: 'Todo', ... },
//   { code: '[bd]', label: '기본설계', labelEn: 'Basic Design', ... },
//   ...
// ]
```

### getStateActions(category: TaskCategory, statusCode: string)

Get available actions (non-transition commands) for state.

```typescript
const actions = getStateActions('development', '[bd]')
// [
//   { command: 'ui', label: 'UI설계', icon: 'pi-palette', ... }
// ]
```

### getAvailableTransitions(category: TaskCategory, statusCode: string)

Get valid state transitions from current state.

```typescript
const transitions = getAvailableTransitions('development', '[bd]')
// [
//   { command: 'draft', label: '상세설계', icon: 'pi-pencil', ... }
// ]
```

### getStatusSeverity(statusCode: string)

Get PrimeVue Badge severity.

```typescript
const severity = getStatusSeverity('[xx]')  // 'success'
const severity = getStatusSeverity('[bd]')  // 'info'
const severity = getStatusSeverity('[ ]')   // 'secondary'
```

### getStatusLabel(statusCode: string)

Get Korean label for display.

```typescript
const label = getStatusLabel('[xx]')  // '완료'
const label = getStatusLabel('[bd]')  // '기본설계'
const label = getStatusLabel('[ ]')   // '시작 전'
```

### getStatusIcon(statusCode: string)

Get PrimeIcons class name.

```typescript
const icon = getStatusIcon('[xx]')  // 'pi-check-circle'
const icon = getStatusIcon('[bd]')  // 'pi-pencil'
const icon = getStatusIcon('[ ]')   // 'pi-inbox'
```

### getProgressWeight(statusCode: string)

Get progress calculation weight (0-100).

```typescript
const weight = getProgressWeight('[xx]')  // 100
const weight = getProgressWeight('[bd]')  // 20
const weight = getProgressWeight('[ ]')   // 0
```

### State Check Helpers

```typescript
isCompleted('[xx]')    // true
isCompleted('[bd]')    // false

isTodo('[ ]')          // true
isTodo('[bd]')         // false

isInProgress('[bd]')   // true
isInProgress('[xx]')   // false
isInProgress('[ ]')    // false
```

## Configuration Structure

See `.jjiban/settings/workflows.json`:

```json
{
  "version": "2.0",
  "states": {
    "[code]": {
      "id": "state-id",
      "label": "한국어",
      "labelEn": "English",
      "icon": "pi-icon",
      "color": "#hex",
      "severity": "info|success|warning|secondary",
      "progressWeight": 0-100
    }
  },
  "commands": {
    "command-name": {
      "label": "한국어",
      "labelEn": "English",
      "icon": "pi-icon",
      "severity": "primary|secondary|info|success|warning|danger",
      "isAction": true|false
    }
  },
  "workflows": {
    "category": {
      "name": "Workflow Name",
      "states": ["[code]", ...],
      "transitions": [
        { "from": "[code]", "to": "[code]", "command": "name" }
      ],
      "actions": {
        "[code]": ["action-command", ...]
      }
    }
  }
}
```

## TypeScript Types

```typescript
import type {
  WorkflowsConfig,
  WorkflowStateConfig,
  WorkflowCommandConfig,
  WorkflowDefinition,
  WorkflowStepInfo,
  WorkflowCommandInfo,
} from '~/types/workflow-config'
```

## Migration Examples

### Before (Hardcoded)

```typescript
const SEVERITY_MAP = {
  '[xx]': 'success',
  '[bd]': 'info',
  // ...
}

const severity = SEVERITY_MAP[status]
```

### After (Configuration)

```typescript
const { getStatusSeverity } = useWorkflowConfig()
const severity = getStatusSeverity(status)
```

---

### Before (Hardcoded)

```typescript
const WORKFLOW_STEPS = {
  development: [
    { code: '[ ]', label: '시작 전' },
    // ...
  ]
}

const steps = WORKFLOW_STEPS[category]
```

### After (Configuration)

```typescript
const { getWorkflowSteps } = useWorkflowConfig()
const steps = getWorkflowSteps(category)
```

---

### Before (Hardcoded)

```typescript
const BUTTON_CONFIG = {
  start: { label: '시작', icon: 'pi-play' }
}

const config = BUTTON_CONFIG[command]
```

### After (Configuration)

```typescript
const { getCommandInfo } = useWorkflowConfig()
const config = getCommandInfo(command)
```

## Performance Notes

- Configuration loaded once per session
- Cached in Nuxt data store
- No repeated API calls
- Minimal runtime overhead
- Type-safe access

## Error Handling

All methods return `undefined` for invalid inputs:

```typescript
const invalid = getStateInfo('[INVALID]')  // undefined
const missing = getCommandInfo('missing')  // undefined

// Safe with optional chaining
const label = getStateInfo('[bd]')?.label || 'Unknown'
```

## Best Practices

1. **Destructure only what you need**:
   ```typescript
   const { getStatusSeverity, getStatusLabel } = useWorkflowConfig()
   ```

2. **Use computed for reactive data**:
   ```typescript
   const severity = computed(() => getStatusSeverity(props.status))
   ```

3. **Handle undefined gracefully**:
   ```typescript
   const label = getStatusLabel(status) || status
   ```

4. **Combine transitions and actions**:
   ```typescript
   const allCommands = [
     ...getAvailableTransitions(category, status),
     ...getStateActions(category, status)
   ]
   ```

5. **Cache workflow steps**:
   ```typescript
   const steps = computed(() => getWorkflowSteps(category))
   ```
