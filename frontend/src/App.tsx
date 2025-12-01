import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { KanbanBoard } from './features/kanban-board/ui/KanbanBoard';
import { WebTerminal } from './features/terminal/ui/WebTerminal';
import { Layout } from './components/layout/Layout';
import { TemplateManagerPage } from './pages/TemplateManagerPage';

const queryClient = new QueryClient();
const PROJECT_ID = '26da4aa0-e6c3-4ddc-911e-d6f277e6a689'; // Seeded Project ID

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="container mx-auto h-full">
                    <KanbanBoard projectId={PROJECT_ID} />
                  </div>
                </div>
                <WebTerminal />
              </div>
            } />
            <Route path="/projects/:projectId/templates" element={<TemplateManagerPage />} />
            {/* Fallback for now */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

