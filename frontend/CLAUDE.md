# CLAUDE.md - Frontend

This file provides guidance to Claude Code when working with the React frontend.

## Overview

JJIban Frontend is a React + TypeScript application built with Vite, providing a kanban board interface with integrated LLM-powered web terminal. Uses TailwindCSS for styling and TanStack Query for server state management.

## Development Commands

### Installation & Setup
```bash
npm install
```

### Development
```bash
npm run dev                 # Start dev server at http://localhost:5173
```

### Build & Preview
```bash
npm run build               # TypeScript compile + Vite build → dist/
npm run preview             # Preview production build locally
```

### Code Quality
```bash
npm run lint                # ESLint check
```

## Architecture

### Project Structure
```
src/
├── components/
│   └── layout/            # Header, Sidebar, Layout wrapper
├── features/              # Feature-based organization
│   ├── kanban-board/
│   │   ├── ui/           # KanbanBoard, KanbanColumn, IssueCard
│   │   ├── hooks/        # useKanbanSocket
│   │   └── api/          # issueApi (axios calls)
│   ├── terminal/
│   │   ├── ui/           # WebTerminal (xterm.js)
│   │   └── hooks/        # useTerminal (WebSocket)
│   ├── workflow/
│   │   ├── ui/           # WorkflowPanel, WorkflowStepCard
│   │   └── hooks/        # useWorkflow
│   ├── doc-viewer/
│   │   ├── ui/           # MarkdownViewer, FileNavigator, DocumentPanel
│   │   ├── hooks/        # useDocumentContent, useFileTree
│   │   ├── api/          # documentApi
│   │   └── types/        # document.types.ts
│   └── llm/
│       └── ui/           # AskAIButton
├── App.tsx               # Root component
├── main.tsx              # Entry point
└── index.css             # Global Tailwind styles
```

### State Management Strategy

**TanStack Query** - Server state (API data):
```typescript
// For data fetching, caching, mutations
const { data, isLoading } = useQuery({
  queryKey: ['issues', projectId],
  queryFn: () => fetchIssues(projectId),
});

const mutation = useMutation({
  mutationFn: updateIssue,
  onSuccess: () => {
    queryClient.invalidateQueries(['issues']);
  },
});
```

**Zustand** - Client state (UI state, non-server data):
```typescript
// Example: Terminal connection state
const useTerminalStore = create((set) => ({
  isConnected: false,
  setConnected: (status) => set({ isConnected: status }),
}));
```

**Socket.io Client** - Real-time updates:
```typescript
// WebSocket connection for terminal and live updates
const socket = io('http://localhost:3000');
socket.on('issueUpdated', (data) => {
  queryClient.invalidateQueries(['issues']);
});
```

### Component Organization Pattern

**Feature-based structure**:
```
features/<domain>/
├── ui/              # React components
├── hooks/           # Custom hooks
└── api/             # API calls (axios)
```

**Component Naming**:
- Components: PascalCase (`KanbanBoard.tsx`)
- Hooks: camelCase with `use` prefix (`useKanbanSocket.ts`)
- API files: camelCase with `Api` suffix (`issueApi.ts`)

## Key Libraries & Usage

### TanStack Query (React Query)
Server state management with caching:
```typescript
// In App.tsx
const queryClient = new QueryClient();
<QueryClientProvider client={queryClient}>

// In components
const { data: issues } = useQuery({
  queryKey: ['issues', projectId],
  queryFn: () => issueApi.fetchAll(projectId),
  refetchInterval: 30000,  // Auto-refresh every 30s
});
```

### Drag and Drop (@hello-pangea/dnd)
Kanban board drag functionality:
```typescript
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="column-todo">
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {/* Draggable items */}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

### xterm.js (Web Terminal)
Terminal emulator with WebSocket:
```typescript
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

const terminal = new Terminal();
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
terminal.open(terminalRef.current);

// Connect to WebSocket
socket.on('terminalOutput', (data) => {
  terminal.write(data);
});
```

### Socket.io Client
Real-time bi-directional communication:
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
});

socket.on('connect', () => console.log('Connected'));
socket.on('issueUpdated', handleIssueUpdate);
socket.emit('terminalInput', { command: 'ls' });
```

### TailwindCSS + CSS Variables
Styling with Tailwind v4:
```typescript
// tailwind.config.js uses @theme directive
// index.css defines CSS custom properties

// Use utility classes:
<div className="flex flex-col h-full bg-gray-900">
  <div className="px-6 py-4 border-b border-gray-700">
```

## Adding New Features

### Create New Feature Module
```bash
# Example: Adding a new "analytics" feature
mkdir -p src/features/analytics/{ui,hooks,api}
```

### Component Template
```typescript
// src/features/analytics/ui/AnalyticsDashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export function AnalyticsDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsApi.fetchData,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      {/* Component content */}
    </div>
  );
}
```

### Custom Hook Template
```typescript
// src/features/analytics/hooks/useAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export function useAnalytics(projectId: string) {
  return useQuery({
    queryKey: ['analytics', projectId],
    queryFn: () => analyticsApi.fetch(projectId),
    enabled: !!projectId,
  });
}
```

### API Layer Template
```typescript
// src/features/analytics/api/analyticsApi.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const analyticsApi = {
  fetch: async (projectId: string) => {
    const { data } = await axios.get(`${API_URL}/analytics/${projectId}`);
    return data;
  },

  update: async (id: string, payload: any) => {
    const { data } = await axios.patch(`${API_URL}/analytics/${id}`, payload);
    return data;
  },
};
```

## Key Implementation Notes

### Hardcoded Project ID
Current implementation uses seeded project ID:
```typescript
// App.tsx
const PROJECT_ID = 'ac2ea160-fd5f-4ac1-a67e-b7e70372e2bf';
```
**TODO**: Replace with dynamic project selection when implementing multi-project support.

### WebSocket Reconnection
Terminal WebSocket should handle reconnection:
```typescript
socket.on('disconnect', () => {
  // Implement reconnection logic
});

socket.on('connect_error', (error) => {
  // Handle connection errors
});
```

### Query Invalidation Pattern
After mutations, invalidate related queries:
```typescript
const mutation = useMutation({
  mutationFn: issueApi.update,
  onSuccess: () => {
    // Refresh issue list
    queryClient.invalidateQueries(['issues']);
    // Refresh specific issue
    queryClient.invalidateQueries(['issue', issueId]);
  },
});
```

### Error Handling
Consistent error handling across API calls:
```typescript
try {
  const data = await issueApi.create(payload);
  return data;
} catch (error) {
  console.error('Failed to create issue:', error);
  throw error;  // Let React Query handle retry
}
```

## Known Incomplete Features

### Missing UI Components
- **Document Viewer**: Markdown rendering with Mermaid diagrams
- **Gantt Chart**: Timeline visualization for issues
- **Backlog View**: Table-based issue list with filtering
- **Dashboard**: Project overview and statistics
- **Prompt Template Manager**: CRUD UI for templates

### Missing Pages/Routing
Currently single-page app. Need to implement:
- `/login` - Authentication
- `/` - Dashboard (project list)
- `/projects/:id/board` - Kanban board
- `/projects/:id/backlog` - Backlog view
- `/projects/:id/gantt` - Gantt chart
- `/projects/:id/settings` - Project settings

### Workflow Integration
- WorkflowPanel exists but lacks:
  - Real-time step progress
  - Approval button functionality
  - Step-by-step log display
  - Auto/manual mode toggle

### Context Menu
- Issue context menu shows but:
  - No dynamic template filtering based on `visibleColumns`
  - Template selection doesn't inject prompt to terminal

## Styling Guidelines

### TailwindCSS v4 Usage
```css
/* index.css - CSS custom properties */
@theme {
  --color-primary: #3b82f6;
  --spacing-kanban: 1.5rem;
}

/* Use in components via utility classes */
<div className="bg-[var(--color-primary)]">
```

### Component Styling Pattern
```typescript
// Consistent dark theme
<div className="bg-gray-900 text-white">
  <div className="border border-gray-700 rounded-lg p-4">
    <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
      Click me
    </button>
  </div>
</div>
```

### Responsive Design
```typescript
// Mobile-first approach
<div className="flex flex-col md:flex-row lg:grid lg:grid-cols-3">
```

## Development Tips

### Hot Module Replacement
Vite provides instant HMR. If state resets on save, use:
```typescript
// Preserve state across HMR
if (import.meta.hot) {
  import.meta.hot.accept();
}
```

### TypeScript Strict Mode
Project uses strict TypeScript. Ensure:
- No `any` types without explicit annotation
- All props typed via interfaces/types
- Null checks for optional values

### React 19 Features
Project uses React 19. Available features:
- Concurrent rendering
- Automatic batching
- Improved Suspense

## Environment Configuration

Vite environment variables (prefix with `VITE_`):
```bash
# .env.local
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

Access in code:
```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

## Build Configuration

`vite.config.ts` is minimal. Common additions:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',  // Proxy API calls
    },
  },
  build: {
    sourcemap: true,  // Enable for debugging
  },
});
```

## Useful Resources

- **TanStack Query Docs**: https://tanstack.com/query/latest
- **Vite Guide**: https://vitejs.dev/guide/
- **TailwindCSS v4**: https://tailwindcss.com/docs
- **xterm.js**: https://xtermjs.org/
- **Socket.io Client**: https://socket.io/docs/v4/client-api/


## Document Viewer Feature

### Overview
The Document Viewer feature allows users to view Markdown documents associated with issues directly from the issue detail modal. It provides GitHub Flavored Markdown rendering with support for code highlighting, math formulas, and Mermaid diagrams.

### Components

#### MarkdownViewer
Renders Markdown content with enhanced features:
- **GitHub Flavored Markdown**: Tables, task lists, strikethrough
- **Code Highlighting**: Syntax highlighting for 10+ languages via highlight.js
- **Math Formulas**: Inline and block math rendering with KaTeX
- **Mermaid Diagrams**: Flowcharts, sequence diagrams, and more
- **Custom Code Blocks**: Copy button and language badges

#### FileNavigator
Tree view for browsing issue documents:
- **Hierarchical Tree**: Folders and files with expand/collapse
- **Search**: Real-time file filtering
- **File Icons**: Different icons for markdown vs other files
- **Selection State**: Highlights currently selected file

#### DocumentPanel
Container component combining navigator and viewer:
- **Split Layout**: File tree on left, viewer on right
- **Loading States**: Spinner while fetching content
- **Error Handling**: User-friendly error messages
- **Empty State**: Helpful message when no file selected

### Usage

```tsx
import { DocumentPanel } from '@/features/doc-viewer';

// In Issue Detail Modal
<DocumentPanel issueId={issue.id} />
```

### API Endpoints
- `GET /api/documents/issues/:issueId/documents` - Get file tree for an issue
- `GET /api/documents/content?path=...` - Get file content
- `POST /api/documents` - Create or update a document

### Custom Hooks

#### useDocumentContent
Fetches and caches document content:
```typescript
const { data, isLoading, error } = useDocumentContent(filePath);
```

#### useFileTree
Manages file tree state and selection:
```typescript
const {
  fileTree,
  selectedFile,
  setSelectedFile,
  expandedFolders,
  toggleFolder
} = useFileTree(issueId);
```

### Styling
Uses TailwindCSS with custom prose styling for markdown content. Dark mode compatible with GitHub Dark theme for code blocks.

### Dependencies
- `react-markdown`: Core markdown rendering
- `remark-gfm`: GitHub Flavored Markdown
- `rehype-highlight`: Code syntax highlighting
- `rehype-katex`: Math formula rendering
- `mermaid`: Diagram rendering

