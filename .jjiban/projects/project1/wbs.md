# WBS - Project1

> version: 1.0
> depth: 4
> updated: 2025-12-13T11:42:46Z

---

## WP-01: Sample Work Package
- status: planned
- priority: high
- schedule: 2025-12-13 ~ 2026-03-13
- progress: 0%

### ACT-01-01: Sample Activity
- status: todo
- schedule: 2025-12-13 ~ 2026-03-13

#### TSK-01-01-01: Sample Development Task
- category: development
- status: [ ]
- priority: medium
- assignee: -
- schedule: 2025-12-13 ~ 2026-03-13
- tags: sample
- depends: -

#### TSK-01-01-02: Sample Defect Task
- category: defect
- status: [ ]
- priority: high
- assignee: -
- schedule: 2025-12-13 ~ 2026-03-13
- tags: bug
- depends: -

#### TSK-01-01-03: Sample Infrastructure Task
- category: infrastructure
- status: [ ]
- priority: low
- assignee: -
- schedule: 2025-12-13 ~ 2026-03-13
- tags: infra
- depends: -

---

<!--
WBS Syntax Reference:

## WP-XX: Work Package Name
- status: planned | in_progress | completed
- priority: critical | high | medium | low
- schedule: YYYY-MM-DD ~ YYYY-MM-DD
- progress: 0-100%

### ACT-XX-XX: Activity Name (4-level structure)
- status: todo | in_progress | completed
- schedule: YYYY-MM-DD ~ YYYY-MM-DD

#### TSK-XX-XX-XX: Task Name (4-level)
- category: development | defect | infrastructure
- status: todo [ ] | design [bd] | detail [dd] | implement [im] | verify [vf] | done [xx]
- priority: critical | high | medium | low
- assignee: member_id | -
- schedule: YYYY-MM-DD ~ YYYY-MM-DD
- tags: tag1, tag2
- depends: TSK-XX-XX-XX | -
- blocked-by: TSK-XX-XX-XX | -
- note: free text

### TSK-XX-XX: Task Name (3-level, no ACT)
- (same as above)
-->
