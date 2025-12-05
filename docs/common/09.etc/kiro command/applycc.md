---
allowed-tools: [Read, Grep, Glob, Edit, MultiEdit, TodoWrite]
description: "Apply fixes and improvements based on LLM-reviewed Cross Check results"
---

# /sc:applycc - Cross Check-Based Improvements

## Purpose
Apply targeted fixes and enhancements derived from issues and recommendations identified in the LLM-reviewed Cross Check document, ensuring quality, performance, maintainability, and adherence to best practices.

## Usage
```
/sc:applycc [task]
```

## Arguments
- `task` - Task defined in `./kiro/specs/*/tasks.md`

## Execution
1. Open `./docs/3. report/cross check/*[task]*.md` and review.  
2. Identify issues and improvement points suggested by the LLM.  
3. Select changes that are favorable to the project.  
4. Evaluate priority and risk level.  
5. Apply changes with proper validation.  
6. If design changes occur, update the corresponding design documents.  
7. Record all changes and updates in the report.
8. execute git commit

## Claude Code Integration
- **Read**: Parse and analyze Cross Check results  
- **MultiEdit**: Apply batch changes  
- **TodoWrite**: Track progress  
- Ensure safety and validation for all changes  