# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JJIban is an AI-assisted development kanban tool that combines project management with LLM integration. The system consists of:
- **Backend**: NestJS + Prisma + PostgreSQL + Socket.io
- **Frontend**: React + Vite + TailwindCSS + TanStack Query + Zustand

The project enables developers to manage tasks via kanban boards while executing LLM-powered workflows through integrated web terminals.

## Detailed Documentation

- **Backend**: See `backend/CLAUDE.md` for NestJS-specific development guidelines
- **Frontend**: See `frontend/CLAUDE.md` for React-specific development guidelines

## Quick Start

### Initial Setup
```bash
# 1. Start PostgreSQL database
docker-compose up -d

# 2. Setup backend
cd backend
npm install
cp .env.example .env  # Edit with your config
npx prisma migrate dev
npx prisma db seed

# 3. Setup frontend
cd ../frontend
npm install
```

### Development Workflow
```bash
# Terminal 1: Backend (http://localhost:3000)
cd backend
npm run start:dev

# Terminal 2: Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api
- **Prisma Studio**: `npx prisma studio` (http://localhost:5555)

## Project Structure

```
jpm/
├── backend/              # NestJS API server
│   ├── src/
│   │   ├── auth/        # JWT authentication
│   │   ├── prisma/      # Database service
│   │   ├── project/     # Project CRUD
│   │   ├── issue/       # Issue/Task management
│   │   ├── terminal/    # WebSocket terminal
│   │   ├── llm/         # LLM integration
│   │   ├── workflow/    # Workflow automation
│   │   └── gateways/    # WebSocket gateways
│   ├── prisma/          # Database schema & migrations
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── CLAUDE.md        # Backend-specific docs
│
├── frontend/            # React SPA
│   ├── src/
│   │   ├── components/  # Shared components
│   │   ├── features/    # Feature modules
│   │   │   ├── kanban-board/
│   │   │   ├── terminal/
│   │   │   ├── workflow/
│   │   │   └── llm/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── CLAUDE.md        # Frontend-specific docs
│
├── docs/                # Project documentation
│   ├── 미구현_기능_분석.md  # Unimplemented features
│   └── wbs.md
│
├── docker-compose.yml   # PostgreSQL container
└── CLAUDE.md           # This file (overview)
```

## Core Architecture

### Communication Flow
```
Frontend (React)
    ↓ HTTP/REST
Backend API (NestJS)
    ↓ Prisma ORM
PostgreSQL Database

Frontend (xterm.js)
    ↔ WebSocket (Socket.io)
Backend Gateway
    → Terminal Process
```

### Database Schema Overview
```
User ──< ProjectMember >── Project
                            │
                            ├──< Issue (self-referencing hierarchy)
                            └──< PromptTemplate

Issue ──< TerminalLog >── PromptTemplate
Issue ──< WorkflowJob ──< WorkflowStep >── TerminalLog
```

**Key Relationships**:
- Issues have parent-child hierarchy (Epic → Feature → Task)
- PromptTemplates filter via `visibleColumns` and `visibleTypes`
- WorkflowJobs track multi-step automated pipelines
- TerminalLogs capture LLM execution history

## Development Patterns

### Backend (NestJS)
- **Module-based**: Feature modules (auth, issue, workflow)
- **DI Pattern**: Services injected via constructor
- **DTO Validation**: `class-validator` on all endpoints
- **WebSocket**: Socket.io for real-time features
- **Documentation**: Swagger auto-generated at `/api`

See `backend/CLAUDE.md` for detailed backend development guide.

### Frontend (React)
- **Feature-based**: Components organized by domain
- **State Management**: TanStack Query (server) + Zustand (client)
- **Styling**: TailwindCSS v4 with CSS variables
- **Real-time**: Socket.io client for live updates
- **Terminal**: xterm.js for web-based terminal

See `frontend/CLAUDE.md` for detailed frontend development guide.

## Environment Configuration

### Backend `.env`
```bash
DATABASE_URL="postgresql://jjiban:jjiban_password@localhost:5432/jjiban_db"
PORT=3000
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
```

### Frontend Environment Variables
```bash
# .env.local (if needed)
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

## Common Development Tasks

### Database Changes
```bash
cd backend

# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. Regenerate client (auto-done by migrate)
npx prisma generate

# View database
npx prisma studio
```

### Adding New Feature
```bash
# Backend
cd backend
nest g module <name>
nest g service <name>
nest g controller <name>

# Frontend
cd frontend
mkdir -p src/features/<name>/{ui,hooks,api}
```

### Running Tests
```bash
# Backend
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage

# Frontend (not yet configured)
cd frontend
npm run test
```

## Key Features

### Implemented ✅
- Kanban board with drag-and-drop
- Web terminal with xterm.js + WebSocket
- Issue CRUD APIs
- Real-time updates via Socket.io
- Database schema with Prisma
- JWT authentication structure
- Basic workflow models

### In Progress / Incomplete ⚠️
- Document viewer (Markdown/Mermaid)
- Prompt template management UI
- Workflow automation execution
- Context menu template filtering
- Auto-documentation generation

See `docs/미구현_기능_분석.md` for comprehensive feature analysis.

## Critical Implementation Notes

### Prompt Template System
Templates use variable placeholders like `{{task.title}}`, `{{project.name}}`. The `visibleColumns` array filters which templates appear in context menus based on issue status.

### Workflow Automation
Multi-step pipelines: design → review → implement → code review. Supports two modes:
- **Fully automated**: Steps run sequentially
- **Human-in-the-loop**: Requires approval after each step

### Hardcoded Project ID
Frontend currently uses seeded project ID: `ac2ea160-fd5f-4ac1-a67e-b7e70372e2bf`
**TODO**: Implement dynamic project selection.

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres

# View logs
docker-compose logs -f postgres
```

### Backend Not Starting
```bash
# Check .env exists
cat backend/.env

# Regenerate Prisma client
cd backend
npx prisma generate
```

### Frontend Build Errors
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Additional Resources

- **NestJS Docs**: https://docs.nestjs.com
- **Prisma Docs**: https://www.prisma.io/docs
- **TanStack Query**: https://tanstack.com/query/latest
- **Vite Guide**: https://vitejs.dev/guide/
- **Socket.io**: https://socket.io/docs/v4/

## basic rule

- 한국어로 대답해줘.