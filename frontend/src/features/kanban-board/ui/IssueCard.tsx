import { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Issue } from '../api/issueApi';
import { issueApi } from '../api/issueApi';
import { IssueDetailModal } from './IssueDetailModal';

interface IssueCardProps {
    issue: Issue;
    index: number;
}

interface ContextMenuTemplate {
    id: string;
    name: string;
    llmType: string;
    prompt: string;
}

export const IssueCard = ({ issue, index }: IssueCardProps) => {
    const [showModal, setShowModal] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; templates: ContextMenuTemplate[] } | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setContextMenu(null);
            }
        };

        if (contextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [contextMenu]);

    const handleContextMenu = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const data = await issueApi.getContextMenu(issue.id);
            setContextMenu({
                x: e.clientX,
                y: e.clientY,
                templates: data.templates,
            });
        } catch (error) {
            console.error('Failed to load context menu:', error);
        }
    };

    const handleTemplateSelect = (template: ContextMenuTemplate) => {
        // Replace template variables
        const processedPrompt = template.prompt
            .replace(/\{ISSUE_TITLE\}/g, issue.title)
            .replace(/\{ISSUE_DESCRIPTION\}/g, issue.description || '')
            .replace(/\{ISSUE_TYPE\}/g, issue.type)
            .replace(/\{ISSUE_STATUS\}/g, issue.status);

        // TODO: Send to terminal via WebSocket
        console.log('Template selected:', template.name);
        console.log('Processed prompt:', processedPrompt);

        // For now, just copy to clipboard
        navigator.clipboard.writeText(processedPrompt);
        alert(`프롬프트가 클립보드에 복사되었습니다:\n\n${template.name} (${template.llmType})`);

        setContextMenu(null);
    };

    return (
        <>
            <Draggable draggableId={issue.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-4 mb-3 bg-card rounded-lg border shadow-sm transition-shadow cursor-pointer ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''
                            }`}
                        style={provided.draggableProps.style}
                        onClick={() => setShowModal(true)}
                        onContextMenu={handleContextMenu}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium px-2 py-1 rounded bg-secondary text-secondary-foreground">
                                {issue.type}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                }`}>
                                {issue.priority}
                            </span>
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{issue.title}</h4>
                        {issue.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {issue.description}
                            </p>
                        )}
                        <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
                            <span>{new Date(issue.updatedAt).toLocaleDateString()}</span>
                            {issue.assigneeId && (
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    {issue.assigneeId.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Draggable>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[200px] z-50"
                    style={{
                        left: `${contextMenu.x}px`,
                        top: `${contextMenu.y}px`,
                    }}
                >
                    {contextMenu.templates.length > 0 ? (
                        contextMenu.templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleTemplateSelect(template)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="font-medium">{template.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{template.llmType}</div>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            사용 가능한 템플릿이 없습니다
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <IssueDetailModal
                    issue={issue}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
};
