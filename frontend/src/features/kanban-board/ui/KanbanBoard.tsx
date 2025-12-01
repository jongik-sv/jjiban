import { useState } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueApi, type Issue } from '../api/issueApi';
import { KanbanColumn } from './KanbanColumn';
import { useKanbanSocket } from '../hooks/useKanbanSocket';
import { WorkflowPanel } from '../../workflow/ui/WorkflowPanel';

const COLUMNS = [
    { id: 'To Do', title: 'To Do' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'Done', title: 'Done' },
];

export const KanbanBoard = ({ projectId }: { projectId: string }) => {
    const queryClient = useQueryClient();
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

    useKanbanSocket(projectId);

    const { data: issues = [], isLoading } = useQuery({
        queryKey: ['issues', projectId],
        queryFn: issueApi.getAll,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            issueApi.updateStatus(id, status),
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: ['issues', projectId] });
            const previousIssues = queryClient.getQueryData<Issue[]>(['issues', projectId]);

            if (previousIssues) {
                queryClient.setQueryData<Issue[]>(['issues', projectId], (old) =>
                    old?.map(issue => issue.id === id ? { ...issue, status } : issue)
                );
            }

            return { previousIssues };
        },
        onError: (_err, _newTodo, context) => {
            queryClient.setQueryData(['issues', projectId], context?.previousIssues);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
        },
    });

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return;

        const newStatus = destination.droppableId;
        updateStatusMutation.mutate({ id: draggableId, status: newStatus });

        // Select the issue if moving to "In Progress"
        if (newStatus === 'In Progress') {
            setSelectedIssueId(draggableId);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    const selectedIssue = selectedIssueId
        ? issues.find((issue) => issue.id === selectedIssueId)
        : null;

    return (
        <div className="flex gap-6 h-full">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex h-full gap-6 overflow-x-auto pb-4 flex-1">
                    {COLUMNS.map(column => (
                        <KanbanColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            issues={issues.filter(issue => issue.status === column.id)}
                            onSelectIssue={setSelectedIssueId}
                            selectedIssueId={selectedIssueId}
                        />
                    ))}
                </div>
            </DragDropContext>

            {selectedIssue && selectedIssue.status === 'In Progress' && (
                <div className="w-96 flex-shrink-0">
                    <WorkflowPanel issueId={selectedIssue.id} />
                </div>
            )}
        </div>
    );
};
