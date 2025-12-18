# Workflow Hardcoding Removal - Phase 4-5 Complete

## Overview

Refactored workflow configuration from hardcoded constants to dynamic configuration loaded from `.jjiban/settings/workflows.json` (schema v2.0).

## Changes Made

### Phase 4: Configuration Infrastructure

#### 1. TypeScript Types (`app/types/workflow-config.ts`)

Created comprehensive type definitions for workflow configuration:

- `WorkflowStateConfig` - State metadata (label, icon, color, severity, progressWeight)
- `WorkflowCommandConfig` - Command metadata (label, icon, severity)
- `WorkflowTransition` - State transition rules
- `WorkflowDefinition` - Complete workflow per category
- `WorkflowsConfig` - Root configuration structure (v2.0)
- `WorkflowStepInfo` - UI rendering information
- `WorkflowCommandInfo` - Button rendering information

#### 2. API Endpoint (`app/server/api/settings/workflows.get.ts`)

- **Route**: `GET /api/settings/workflows`
- **Returns**: Complete workflows.json configuration
- **Caching**: Session-level caching in composable
- **Error handling**: 500 status with descriptive message

#### 3. Composable (`app/composables/useWorkflowConfig.ts`)

Centralized workflow configuration access with reactive data:

**Core Functions**:
- `getStateInfo(code)` - Get state configuration by status code
- `getCommandInfo(cmd)` - Get command configuration by name
- `getWorkflowSteps(category)` - Get ordered workflow steps for category
- `getStateActions(category, statusCode)` - Get available actions for state
- `getAvailableTransitions(category, statusCode)` - Get valid transitions from state

**Helper Functions**:
- `getStatusSeverity(code)` - PrimeVue severity for Badge component
- `getStatusLabel(code)` - Korean label for display
- `getStatusIcon(code)` - PrimeIcons class name
- `getProgressWeight(code)` - Progress calculation weight
- `isCompleted(code)` - Check if status is done
- `isTodo(code)` - Check if status is todo
- `isInProgress(code)` - Check if status is in progress

#### 4. Utility Updates

**`app/utils/wbsProgress.ts`**:
- Removed hardcoded `STATUS_CATEGORY` mapping
- Removed hardcoded `severityMap` and `labelMap`
- Added deprecation notices pointing to `useWorkflowConfig()`
- Kept basic logic for backwards compatibility

**`app/utils/workflowCommands.ts`**:
- Added `@deprecated` documentation with migration guide
- Marked for future removal in favor of `useWorkflowConfig()`

### Phase 5: Component Updates

#### 1. TaskProgress.vue Updates

**Before**:
```typescript
const workflowSteps = computed(() => {
  const workflows: Record<TaskCategory, WorkflowStep[]> = {
    development: [
      { code: '[ ]', label: '시작 전' },
      { code: '[bd]', label: '기본설계' },
      // ... hardcoded steps
    ],
    // ... hardcoded workflows
  }
  return workflows[props.task.category]
})

const stepActionsMap: Record<string, Record<string, string[]>> = {
  development: {
    '[ ]': ['start'],
    '[bd]': ['draft', 'ui'],
    // ... hardcoded actions
  },
  // ... hardcoded mappings
}

const workflowButtonConfig: Record<string, { label: string; icon: string; severity: string }> = {
  start: { label: '시작', icon: 'pi pi-play', severity: 'primary' },
  // ... hardcoded config
}
```

**After**:
```typescript
const workflowConfig = useWorkflowConfig()

const workflowSteps = computed(() => {
  const steps = workflowConfig.getWorkflowSteps(props.task.category)
  return steps.map(step => ({
    code: step.code,
    label: step.label,
  }))
})

function getStepActions(stepCode: string): string[] {
  const transitions = workflowConfig.getAvailableTransitions(props.task.category, stepCode)
  const actions = workflowConfig.getStateActions(props.task.category, stepCode)
  return [...new Set([...transitions.map(t => t.command), ...actions.map(a => a.command)])]
}

function getActionLabel(action: string): string {
  const cmdInfo = workflowConfig.getCommandInfo(action)
  return cmdInfo?.label || action
}

function getActionIcon(action: string): string {
  const cmdInfo = workflowConfig.getCommandInfo(action)
  return cmdInfo?.icon || 'pi-arrow-right'
}

function getActionSeverity(action: string): string {
  const cmdInfo = workflowConfig.getCommandInfo(action)
  return cmdInfo?.severity || 'secondary'
}
```

**Changes**:
- Removed 3 hardcoded configuration objects (70+ lines)
- Dynamic workflow steps from configuration
- Dynamic action buttons from configuration
- Dynamic button labels, icons, and severities

#### 2. TaskWorkflow.vue Updates

**Before**:
```typescript
import { WORKFLOW_STEPS } from '~/types'

const workflowSteps = computed<WorkflowStep[]>(() => {
  return WORKFLOW_STEPS[props.task.category] || WORKFLOW_STEPS.development
})
```

**After**:
```typescript
import type { WorkflowStepInfo } from '~/types/workflow-config'

const workflowConfig = useWorkflowConfig()

const workflowSteps = computed<WorkflowStepInfo[]>(() => {
  return workflowConfig.getWorkflowSteps(props.task.category)
})
```

**Template Updates**:
```vue
<!-- Before -->
<div class="font-semibold">{{ step.name }}</div>
<div class="text-xs opacity-70">{{ step.description }}</div>

<!-- After -->
<div class="font-semibold">{{ step.labelEn }}</div>
<div class="text-xs opacity-70">{{ step.label }}</div>
```

**Changes**:
- Removed hardcoded WORKFLOW_STEPS import
- Uses configuration-based workflow steps
- Template updated to use new property names (labelEn, label)

#### 3. Type System Updates

**`app/types/index.ts`**:
- Added `completed?: CompletedTimestamps` to `TaskDetail` interface
- Ensures compatibility with TaskProgress.vue's `getCompletedDate()` function

## Benefits

### 1. Configuration Flexibility
- Workflow modifications only require editing `.jjiban/settings/workflows.json`
- No code changes or recompilation needed for workflow adjustments
- Support for custom workflows per installation

### 2. Maintainability
- Single source of truth for workflow configuration
- No scattered hardcoded constants across multiple files
- Type-safe configuration access

### 3. Extensibility
- Easy to add new workflow states
- Easy to add new commands
- Easy to modify state transitions
- Easy to change UI properties (colors, icons, labels)

### 4. Consistency
- All components use same configuration source
- Unified workflow behavior across application
- Automatic consistency when configuration changes

## Migration Guide

### For Developers

**Old Pattern**:
```typescript
import { WORKFLOW_STEPS } from '~/types'
const steps = WORKFLOW_STEPS[category]
```

**New Pattern**:
```typescript
const { getWorkflowSteps } = useWorkflowConfig()
const steps = getWorkflowSteps(category)
```

**Old Pattern**:
```typescript
import { getStatusSeverity, getStatusLabel } from '~/utils/wbsProgress'
const severity = getStatusSeverity(status)
const label = getStatusLabel(status)
```

**New Pattern**:
```typescript
const { getStatusSeverity, getStatusLabel } = useWorkflowConfig()
const severity = getStatusSeverity(status)
const label = getStatusLabel(status)
```

**Old Pattern**:
```typescript
import { WORKFLOW_COMMANDS } from '~/utils/workflowCommands'
const commands = WORKFLOW_COMMANDS.filter(...)
```

**New Pattern**:
```typescript
const { getAvailableTransitions, getStateActions } = useWorkflowConfig()
const transitions = getAvailableTransitions(category, status)
const actions = getStateActions(category, status)
```

### For Configuration

**Workflow modification example**:
```json
{
  "version": "2.0",
  "states": {
    "[bd]": {
      "label": "기본설계", // Change Korean label
      "labelEn": "Basic Design", // Change English label
      "icon": "pi-pencil", // Change icon
      "color": "#3b82f6", // Change color
      "severity": "info" // Change PrimeVue severity
    }
  },
  "commands": {
    "start": {
      "label": "시작하기", // Change button label
      "icon": "pi-play-circle" // Change button icon
    }
  },
  "workflows": {
    "development": {
      "states": ["[ ]", "[bd]", "[dd]", "[ap]", "[im]", "[vf]", "[xx]"],
      "transitions": [
        { "from": "[ ]", "to": "[bd]", "command": "start" }
        // Add/remove transitions
      ],
      "actions": {
        "[bd]": ["ui", "review"] // Add/remove actions
      }
    }
  }
}
```

## Files Changed

### Created
- `app/types/workflow-config.ts` - Type definitions
- `app/server/api/settings/workflows.get.ts` - API endpoint
- `app/composables/useWorkflowConfig.ts` - Configuration composable

### Modified
- `app/utils/wbsProgress.ts` - Simplified, added deprecation notices
- `app/utils/workflowCommands.ts` - Added deprecation documentation
- `app/components/wbs/detail/TaskProgress.vue` - Dynamic configuration
- `app/components/wbs/detail/TaskWorkflow.vue` - Dynamic configuration
- `app/types/index.ts` - Added `completed` to TaskDetail

### Configuration
- `.jjiban/settings/workflows.json` - Schema v2.0 (already existed)

## Testing

Run validation test:
```bash
node test-workflow-config.cjs
```

Expected output:
```
✅ All tests passed!

Phase 4-5 Refactoring Complete:
  ✓ Workflow configuration schema v2.0 validated
  ✓ TypeScript types created
  ✓ API endpoint created
  ✓ Composable created
  ✓ Components updated
```

## Next Steps

1. **Test Application**:
   ```bash
   npm run dev
   ```

2. **Verify Workflow UI**:
   - Navigate to task detail view
   - Check workflow stepper renders correctly
   - Test command buttons in different states
   - Verify state labels, icons, and colors

3. **Browser Console**:
   - Check for configuration loading errors
   - Verify no undefined references

4. **Future Cleanup** (Phase 6):
   - Remove deprecated functions from `app/utils/wbsProgress.ts`
   - Remove `app/utils/workflowCommands.ts` entirely
   - Remove `WORKFLOW_STEPS` from `app/types/index.ts`
   - Update all remaining usages to `useWorkflowConfig()`

## Technical Notes

### Caching Strategy
- Configuration loaded once per session via `useFetch` with `getCachedData`
- Shared across all component instances
- Refresh available via `refresh()` function

### Backwards Compatibility
- Utility functions still exist with deprecation notices
- Existing code continues to work during transition
- Migration can be done incrementally

### Performance Impact
- Single API call per session (cached)
- No performance degradation
- Reduced bundle size (removed hardcoded data)

## Conclusion

Phase 4-5 successfully removes workflow hardcoding from the application. All workflow configuration is now centralized in `.jjiban/settings/workflows.json` with type-safe access through `useWorkflowConfig()` composable. The refactoring maintains full backwards compatibility while enabling flexible workflow customization without code changes.
