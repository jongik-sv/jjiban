import type { FC } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { IssueCard } from './IssueCard';
import type { Issue } from '../api/issueApi';

interface KanbanColumnProps {
    id: string;
    title: string;
    issues: Issue[];
    onSelectIssue?: (issueId: string | null) => void;
    selectedIssueId?: string | null;
}

export const KanbanColumn: FC<KanbanColumnProps> = ({
    id,
    title,
    issues,
    onSelectIssue,
    selectedIssueId
}) => {
    return (
        <div className="flex flex-col w-80 shrink-0">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {issues.length}
                </span>
            </div>
            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 bg-secondary/30 rounded-xl p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-secondary/60' : ''
                            }`}
                        style={{ minHeight: '500px' }}
                    >
                        {issues.map((issue, index) => (
                            <div
                                key={issue.id}
                                onClick={() => onSelectIssue?.(issue.id)}
                                className={`cursor-pointer mb-2 transition-transform ${selectedIssueId === issue.id ? 'ring-2 ring-primary rounded' : ''
                                    }`}
                            >
                                <IssueCard issue={issue} index={index} />
                            </div>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};
