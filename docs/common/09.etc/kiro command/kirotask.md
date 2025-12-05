---
allowed-tools: [Read, Write, Edit, MultiEdit, Bash, Glob, TodoWrite, Task, mcp__sequential-thinking__sequentialthinking, mcp__context7__context7]
description: "Implement task design, features, and code through intelligent persona activation and MCP integration."
personas: [architect, analyzer, project-manager, frontend, backend, security, devops]
mcp-servers: [sequential, context7]
---

# /sc:kirotask - Task 구현

## Purpose
Implement features, task components, and code functionality through intelligent persona activation and comprehensive development support.

## Usage
```
/sc:kirotask [task name] [--safe] [--iterative]
```

## Arguments
- `task name` - Description of what to implement
- `--safe` - Use conservative implementation approach
- `--iterative` - Enable iterative development with validation steps

## Execution
### 1. Auto-Detect Tech Stack and Personas
- Automatically detect build/test runner and technology stack.  
- Automatically activate relevant personas for each phase (Frontend, Backend, Security, QA, DevOps).  

### 2. MCP Tuning
- UI: Magic  
- Pattern: Context7  
- Complex Logic: Sequential  

### 3. Workflow
1. **Define Requirements and Acceptance Criteria**.  
2. **Detailed Design** *(mandatory before implementation)*:  
   - References: `./kiro/specs/*/design.md`,`./docs/1. project charter/*prd*.md`, `./docs/5. reference/migration/*`, `/docs/2. design/basic/*`
   - Location: `./docs/2. design/2. details/`  
   - File name format: `[Task Name].md` (e.g., `Task 1.1 Project Initialization.md`)  
   - Do not include source code. Only conceptual or pseudo code is allowed for illustration.
   - After writing, compare with previous concept → if different, stop immediately, explain the difference, and wait for instructions.  
3. **TDD**: Write a failing test → Verify failure → Minimal implementation → Refactor.  
4. **Implementation**: Apply best practices (readability, error handling, logging, i18n, etc.).  
5. **Security/Quality Verification**: Input validation, authentication/authorization, secret management, dependency vulnerability checks, linting/static analysis.  
6. **Post-Test Recommendations**: Suggest next steps or additional testing.  
7. **Design-to-Implementation Consistency Check**: Verify and save the implementation verification report in `./docs/3. report/1. implementation/` at the end of each phase. 
8. Refer to detail design template file(`./docs/04.template/detail_design_template.md`) when creating this design.

### 4. Test Execution
- Run `npm test`; if interactive, automatically provide `"q"` input.  

### 5. Claude Code Integration
- **Write/Edit/MultiEdit**: Code generation and modification.  
- **Read/Glob**: Codebase analysis and context gathering.  
- **TodoWrite**: Track implementation progress.  
- **Task**: Manage complex multi-step implementations.  
- **MCP Server Integration**: Use for specialized features.  
- Auto-switch personas based on implementation type.  

## Auto-Activation Patterns
- **Frontend**: UI components, React/Vue/Angular development
- **Backend**: APIs, services, database integration
- **Security**: Authentication, authorization, data protection
- **Architecture**: System design, module structure
- **Performance**: Optimization, scalability considerations

## Examples
```
/sc:kirotask Task 1.1 
/sc:kirotask Task 1.1 Project Initialization --safe --iterative
```
